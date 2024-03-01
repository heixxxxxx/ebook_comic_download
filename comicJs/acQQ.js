
class QQComic {
  constructor(webObj) {
    //腾讯的数据全是存放加密
    this.DATA = ""
    //密钥
    this.nonce = ""
    this.comicMsg = { "网站": webObj.name };
    //解密后数据
    this.data = {}
    this.cleanCopyDom()
  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载
  download() {
    this.getImgToken()
  }
  // 通过地址栏的链接获取到这一话的id
  getDATA() {
    if (window.DATA) {
      this.DATA = window.DATA
    } else {
      this.DATA = pg_ChapterIndex.data
    }
  }
  getKey() {
    let jsList = document.getElementsByTagName("script")
    for (let i = 0; i < jsList.length; i++) {
      if (!jsList[i].src) {
        let text = jsList[i].innerText.replace(/\"/g, "").replace(/\+/g, "")
        if (text.indexOf(`window[nonce]`) == 0) {
          eval(jsList[i].innerText)
          this.nonce = window.nonce
        }

      }
    }
  }
  //对字符串解密
  decrypt(){
      _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      this.decode = function (c) {
        var a = "", b, d, h, f, g, e = 0;
        for (c = c.replace(/[^A-Za-z0-9\+\/\=]/g, ""); e < c.length;) {
          b = _keyStr.indexOf(c.charAt(e++)),
            d = _keyStr.indexOf(c.charAt(e++)),
            f = _keyStr.indexOf(c.charAt(e++)),
            g = _keyStr.indexOf(c.charAt(e++)),
            b = b << 2 | d >> 4,
            d = (d & 15) << 4 | f >> 2,
            h = (f & 3) << 6 | g,
            a += String.fromCharCode(b),
            64 != f && (a += String.fromCharCode(d)),
            64 != g && (a += String.fromCharCode(h));
        }
        return a = _utf8_decode(a)
      }
        ;
      _utf8_decode = function (c) {
        for (var a = "", b = 0, d = c1 = c2 = 0; b < c.length;) {
          d = c.charCodeAt(b),
            128 > d ? (a += String.fromCharCode(d),
              b++) : 191 < d && 224 > d ? (c2 = c.charCodeAt(b + 1),
                a += String.fromCharCode((d & 31) << 6 | c2 & 63),
                b += 2) : (c2 = c.charCodeAt(b + 1),
                  c3 = c.charCodeAt(b + 2),
                  a += String.fromCharCode((d & 15) << 12 | (c2 & 63) << 6 | c3 & 63),
                  b += 3);
        }
    
        return a
      }
    
  }
  getComicInfo() {
    fetch("https://manga.bilibili.com/twirp/comic.v1.Comic/GetEpisode?device=pc&platform=web", {
      "headers": {
        "content-type": "application/json;charset=UTF-8",
        "referrerPolicy": "strict-origin-when-cross-origin",
      },
      "body": JSON.stringify({ id: this.epId }),
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    })
      .then(r => r.json())
      .then(response => {
        this.comicMsg['漫画名'] = response.data.comic_title
        this.comicMsg[`单集数`] = "第" + response.data.short_title + "话"
        this.comicMsg[`标题`] = response.data.title
        this.getImageList()
      })
  }
  // 获取图片列表 (发送漫画信息)
  getImageList() {
    fetch("https://manga.bilibili.com/twirp/comic.v1.Comic/GetImageIndex?device=pc&platform=web", {
      "headers": {
        "content-type": "application/json;charset=UTF-8",
        "referrerPolicy": "strict-origin-when-cross-origin",
      },
      "body": JSON.stringify({ epId: this.epId }),
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    })
      //这是一种异步写法，then发生在上面的fetch请求有返回结果以后，response就是返回值，.json是把返回值转成json对象
      .then(r => r.json())
      .then(response => {
        // 获得res中的图片地址信息
        this.imageList = response.data.images
        this.comicMsg[`总页数`] = this.imageList.length <= 2 ? '未购买' : this.imageList.length
        //发送消息
        this.sendMsg(1)
      })
  }
  //通过图片列表的地址，获取真实图片链接和token
  getImgToken(imageList = this.imageList) {
    let imgList = []
    for (let i = 0; i < imageList.length; i++) {
      imgList.push(imageList[i].path)
    }
    fetch("https://manga.bilibili.com/twirp/comic.v1.Comic/ImageToken?device=pc&platform=web", {
      "headers": {
        "content-type": "application/json;charset=UTF-8",
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": JSON.stringify({ urls: JSON.stringify(imgList) }),
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json())
      .then(r => {
        this.sendMsg(2, { allPage: imageList.length, nowPage: 0 })
        let downloadUrlList = []
        //循环一下，把每个地址组合
        for (let i = 0; i < r.data.length; i++) {
          //下载 
          downloadUrlList.push(r.data[i].url + "?token=" + r.data[i].token)
        }
        this.downloadImg(downloadUrlList)
      })
  }
  downloadImg(url, page = 1) {
    if (url.length == 0) {
      this.sendMsg(4)
      return 0
    }
    this.sendMsg(2, { allPage: this.imageList.length, nowPage: page })
    fetch(url[0]).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
      a_dom.href = URL.createObjectURL(blob)
      a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
      a_dom.click()
      url.splice(0, 1)
      this.downloadImg(url, page + 1)
    })

  }
  cleanCopyDom() {
    let list = document.getElementsByClassName("bullet-screen")
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].remove()
    }
    listenDomChange(document.getElementsByClassName("image-container")[0], () => {
      let list = document.getElementsByClassName("bullet-screen")
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].remove()
      }
    })
  }
}



function BBA() {
  _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  this.decode = function (c) {
    var a = "", b, d, h, f, g, e = 0;
    for (c = c.replace(/[^A-Za-z0-9\+\/\=]/g, ""); e < c.length;) {
      b = _keyStr.indexOf(c.charAt(e++)),
        d = _keyStr.indexOf(c.charAt(e++)),
        f = _keyStr.indexOf(c.charAt(e++)),
        g = _keyStr.indexOf(c.charAt(e++)),
        b = b << 2 | d >> 4,
        d = (d & 15) << 4 | f >> 2,
        h = (f & 3) << 6 | g,
        a += String.fromCharCode(b),
        64 != f && (a += String.fromCharCode(d)),
        64 != g && (a += String.fromCharCode(h));
    }
    return a = _utf8_decode(a)
  }
    ;
  _utf8_decode = function (c) {
    for (var a = "", b = 0, d = c1 = c2 = 0; b < c.length;) {
      d = c.charCodeAt(b),
        128 > d ? (a += String.fromCharCode(d),
          b++) : 191 < d && 224 > d ? (c2 = c.charCodeAt(b + 1),
            a += String.fromCharCode((d & 31) << 6 | c2 & 63),
            b += 2) : (c2 = c.charCodeAt(b + 1),
              c3 = c.charCodeAt(b + 2),
              a += String.fromCharCode((d & 15) << 12 | (c2 & 63) << 6 | c3 & 63),
              b += 3);
    }

    return a
  }
}
// var B = new BBA()
// var T = window.DATA
// var T = T.split('');
// var N = "da5c4bb985e49d93c390301cf7151aeb"
// var len, locate, str;
// N = N.match(/\d+[a-zA-Z]+/g);
// len = N.length;
// while (len--) {
//   locate = parseInt(N[len]) & 255;
//   str = N[len].replace(/\d+/g, '');
//   T.splice(locate, str.length)
// }
// T = T.join('');
// _v = JSON.parse(B.decode(T));
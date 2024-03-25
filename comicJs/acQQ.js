


class QqComic {
  constructor(webObj) {
    //动态注入解码数据
    injectedScriptToPage("/modules/acQQ.js")
    //腾讯的数据全是存放加密
    this.DATA = ""
    this.imageList = []
    //密钥
    this.nonce = ""
    this.comicMsg = { "网站": webObj.name };
    //解密后数据
    this.data = {}
    this.getDATA()

    this.cleanCopyDom()

  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载
  download() {
    downloadByFetch([...this.imageList], this)
  }
  //数据 密钥
  getDATA(n = 0) {
    if (document.getElementById("nonceToContent")) {
      this.nonce = document.getElementById("nonceToContent").innerText
      let jsList = document.getElementsByTagName("script")
      for (let i = 0; i < jsList.length; i++) {
        if (!jsList[i].src) {
          let text = jsList[i].innerText.replace(/\"/g, "").replace(/\+/g, "").replace(/ /g, "")
          // if (text.indexOf(`window[nonce]`) != -1) {
          //   console.log(jsList[i].innerText.split("=")[1])
          //   this.nonce = this.decodeSecretKey(jsList[i].innerText.split("=")[1])
          // } else 
          if (text.indexOf(`DATA=`) != -1) {
            this.DATA = jsList[i].innerText.split(",")[0].match(/'([^']*)'/)[1]
          } else if (text.indexOf(`pg_ChapterIndex.data`) != -1) {
            let dataText = jsList[i].innerText.slice(text.indexOf(`pg_ChapterIndex.data`))
            this.DATA = dataText.split(",")[0].match(/'([^']*)'/)[1]
          }

        }
      }
      this.getComicInfo()
    } else {
      if (n == 100) return
      setTimeout(() => {
        this.getDATA(n + 1)
      }, 200)
    }




  }
  decodeSecretKey(text) {
    let textList = text.slice(0, -1).replace(/" \+ \(/g, "$").replace(/\) \+ "/g, "$").replace(/\) \+ \(/g, "$").split("$")
    let list = []
    textList.forEach((item, index) => {
      let match = item.match(/eval\("([^"]+)"\)/);
      if (match) {
        item = (match[1]); // 输出: !!1
        item = item.replace(/!!/g, "")
        item = item.replace(/!!/g, "")
        item = item.replace(/document.getElementsByTagName\('html'\)/g, "1")
        item = item.replace(/'123'.substring\(2\)/g, "3")
        item = item.replace(/'123'.substring\(0\)/g, "1")
        item = item.replace(/'123'.substring\(1\)/g, "2")
        item = item.replace(/Math.round\(.5\)/g, "1")
        item = item.replace(/~~1.+d/g, "1")
        item = item.replace(/parseInt\(7\/3\)/g, "2")
        item = item.replace(/document.children/g, "1")
        item = item.replace(/window.Array/g, "1")
        item = item.replace(/Math./g, "")
        item = item.replace(/!!/g, "")
        item = item.replace(/!1/g, "0")
        item = item.replace(/!0/g, "1")
        item = math.evaluate(item) - 0
        list.push(item)
      } else {
        list.push(item.replace(/\"/g, ""))
      }
    })

    return list.join("")

  }
  //对字符串解密
  decrypt(data) {
    let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let c = data
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

    return a = this._utf8_decode(a)
  }
  _utf8_decode(c) {
    for (var a = "", b = 0, d = 0, c1 = 0, c2 = 0, c3 = 0; b < c.length;) {
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
  getComicInfo() {
    let T = this.DATA
    T = T.split('');
    let N = this.nonce
    var len, locate, str;
    N = N.match(/\d+[a-zA-Z]+/g);
    len = N.length;
    while (len--) {
      locate = parseInt(N[len]) & 255;
      str = N[len].replace(/\d+/g, '');
      T.splice(locate, str.length)
    }
    T = T.join('');
    let data = JSON.parse(this.decrypt(T));
    this.comicMsg['漫画名'] = data.comic.title
    this.comicMsg[`单集数`] = data.chapter.cTitle
    this.comicMsg[`页数`] = data.picture.length
    this.comicMsg[`图片尺寸`] = data.picture[0].width + "px * " + data.picture[0].height + "px"
    data.picture.forEach((item) => {
      this.imageList.push(item.url)
    })

    this.sendMsg(1)
  }
  cleanCopyDom() {
    let list = document.getElementsByClassName("for-roast")
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].remove()
    }
    listenDomChange(document.getElementById("mainView"), () => {
      let list = document.getElementsByClassName("for-roast")
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].remove()
      }
    })
  }
}




class HakusenshaComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    //请求参数
    this.param = ""
    //图片解密参数
    this.scramble = {
      width: 0,
      height: 0,
    }
    this.transferCanvas = document.createElement("canvas")
    this.getBookInfo()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.getPage()
  }
  //获取图书信息
  getBookInfo() {
    //设置param
    let metaList = document.getElementById('meta').children
    for (let i = 0; i < metaList.length; i++) {
      if (metaList[i].getAttribute('name') == "param") {
        this.param = encodeURIComponent(metaList[i].value)
      }
    }

    fetch(`https://bsreader.hakusensha-e.net/diazepam_hybrid?mode=7&file=face.xml&reqtype=0&vm=4&param=${this.param}&time=` + (new Date).getTime() % 1e7, {
      "headers": {
        "credentials": 'include',
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(response => response.text()).then(str => (new window.DOMParser()).parseFromString(str, "text/xml")).then(Rxml => {
      let topItem = Rxml.getElementsByTagName('TocItem')
      this.comicMsg["总页数"] = Rxml.getElementsByTagName('TotalPage')[0].innerHTML
      this.comicMsg["图片尺寸约"] = Rxml.getElementsByTagName('ContentFrame')[0].children[0].innerHTML + " * " + Rxml.getElementsByTagName('ContentFrame')[0].children[1].innerHTML
      this.comicMsg["目录"] = ""
      this.scramble.width = Rxml.getElementsByTagName('Scramble')[0].children[0].innerHTML
      this.scramble.height = Rxml.getElementsByTagName('Scramble')[0].children[1].innerHTML
      for (let i = 0; i < topItem.length; i++) {
        this.comicMsg[topItem[i].children[1].innerHTML] = "p" + topItem[i].children[0].innerHTML
      }
      this.sendMsg(1)
    })
  }
  //页面信息，密钥
  getPage(page = 0) {
    let fileName = page + ""
    for (let i = (page + "").length; i < 4; i++) {
      fileName = "0" + fileName
    }
    this.sendMsg(2, { nowPage: page })
    //获取page
    fetch(`https://bsreader.hakusensha-e.net/diazepam_hybrid?mode=8&file=${fileName}.xml&reqtype=0&vm=4&param=${this.param}&time=` + (new Date).getTime() % 1e7, {
      "headers": {
        "credentials": 'include',
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
      "referrer": "https://bsreader.hakusensha-e.net/?param=0i%2BWN%2B2IVLmJw%2B4TQRsf6VZuJXXYZUx4j0mP7fxFk9qzrn2aLKwuvs4vagVBGBiBHc1vj82Uhscsdw5%2B3B0Nze4jPmJe%2Byxf09fc52xfJr1MjE3SwFE1mkE4IZP%2BE8p%2B9IslbyekC3UQBHgeZjToUA%3D%3D&file=face.xml&trial=0_9&colophon=https%3A%2F%2Fwww.hakusensha-e.net%2Fbs%2Fcolophon%2F2123XXXXhanayme02407%2Ftrial&colophon_size=300_450&continue=0&notification_every=0&cgi=https://bsreader.hakusensha-e.net/diazepam_hybrid&url=https://www.hakusensha-e.net/store/product/2123XXXXhanayme02407",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(response => response.text()).then(str => (new window.DOMParser()).parseFromString(str, "text/xml")).then(Rxml => {
      if (Rxml.getElementsByTagName('Scramble')[0]) {
        //获得密钥
        this.makeImg(page, fileName, Rxml.getElementsByTagName('Scramble')[0].innerHTML.split(","))
      } else {
        this.sendMsg(4)
      }

    })

  }
  //获取图片 解密 下载
  makeImg(page, fileName, key) {
    fetch(`https://bsreader.hakusensha-e.net/diazepam_hybrid?mode=1&file=${fileName}_0000.bin&reqtype=0&vm=4&param=${this.param}&time=` + (new Date).getTime() % 1e7, {
      "headers": {
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "cache-control": "no-cache",
        "credentials": 'include',
        "pragma": "no-cache",
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(response => response.blob()
    ).then(blob => { // 将链接地址字符内容转变成blob地址
      if (!blob) {
        this.sendMsg(4)
        return 0
      }
      let image = new Image()
      image.src = URL.createObjectURL(blob)
      image.setAttribute("crossOrigin", "use-credentials");
      image.onload = (e) => {
        let canvas = document.createElement("canvas")
        canvas.width = image.width
        canvas.height = image.height
        canvas.getContext("2d").drawImage(image, 0, 0);
        this.unscrambling(canvas, key)
        a_dom.href = canvas.toDataURL()
        a_dom.download = fileName + ".jpg";
        a_dom.click()
        this.getPage(page + 1)
      }
    })
  }
  //解密程序
  unscrambling = function (t, r) {
    var o = this.scramble.width
      , n = this.scramble.height;
    if (!(r.length < o * n || t.width < 8 * o || t.height < 8 * n)) {
      var a = t.getContext("2d")
        , i = this.transferCanvas
        , s = i.getContext("2d");
      i.width = 0,
        i.height = 0,
        i.width = t.width,
        i.height = t.height,
        s.drawImage(t, 0, 0);
      for (var u, c, l, d, p, h = 8 * Math.floor(Math.floor(t.width / o) / 8), g = 8 * Math.floor(Math.floor(t.height / n) / 8), f = r.length, b = 0; b < f; b++)
        u = b % o,
          c = Math.floor(b / o),
          u *= h,
          c *= g,
          l = (p = r[b]) % o,
          d = Math.floor(p / o),
          l *= h,
          d *= g,
          a.clearRect(u, c, h, g),
          a.drawImage(i, l, d, h, g, u, c, h, g);
      s.clearRect(0, 0, i.width, i.height),
        i.width = 0,
        i.height = 0,
        s = null,
        i = null
    }
  }

}
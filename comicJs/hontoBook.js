
class HontoComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.zipFlag = false
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
  downloadZip() {
    this.zipFlag = true
    this.getPage()
  }
  //获取图书信息
  getBookInfo() {
    //设置param
    let metaList = document.getElementById('meta').children
    this.baseUrl = ""
    for (let i = 0; i < metaList.length; i++) {
      if (metaList[i].getAttribute('name') == "param") {
        this.param = encodeURIComponent(metaList[i].value)
      } else if (metaList[i].getAttribute('name') == "cgi") {
        this.baseUrl = (metaList[i].value)
      }
    }
    fetch(`${this.baseUrl}?mode=999&reqtype=1&file=&param=${this.param}&vm=4&ts=` + new Date().getTime(), {
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
      this.param = encodeURIComponent(Rxml.getElementsByTagName('Content')[0].innerHTML.replace(/ /g, "+"))
      console.log(this.param)
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
    fetch(`${this.baseUrl}?mode=8&file=${fileName}.xml&reqtype=0&vm=4&param=${this.param}&ts=` + (new Date).getTime(), {
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
        if (this.zipFlag) {
          zip.generateAsync({ type: "blob" })
            .then((content) => {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(content);
              a.download = (this.comicMsg['漫画名'] || this.comicMsg['书名'] || '下载') + ".zip";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              this.sendMsg(4)
            });
        } else {
          this.sendMsg(4)
        }
      }

    })

  }
  //获取图片 解密 下载
  makeImg(page, fileName, key) {
    fetch(`${this.baseUrl}?mode=1&file=${fileName}_0000.bin&reqtype=0&vm=4&param=${this.param}&ts=` + (new Date).getTime(), {
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
        if (this.zipFlag) {
          zip.generateAsync({ type: "blob" })
            .then((content) => {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(content);
              a.download = (this.comicMsg['漫画名'] || this.comicMsg['书名'] || '下载') + ".zip";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              this.sendMsg(4)
            });
        } else {
          this.sendMsg(4)
        }
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
        this.unscrambling(canvas.getContext("2d"), image, key)
       
        if (this.zipFlag) {
          zip.file(fileName + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
        } else {
          chrome.runtime.sendMessage({
            downloadUrl: canvas.toDataURL(),
            filename: fileName + ".jpg"
          });
        }
       
    
        this.getPage(page + 1)
      }
    })
  }
  //解密程序
  unscrambling(t, C, c) {
    let o = ((((C.naturalWidth / 4) | 0) / 8) | 0) * 8;
    let v = ((((C.naturalHeight / 4) | 0) / 8) | 0) * 8;
    var s = (o * 4);
    var B = (v * 4);

    this.drawImage4Other(C, t, C.naturalWidth - s, B, s, 0, s, 0);
    this.drawImage4Other(C, t, C.naturalWidth, C.naturalHeight - B, 0, B, 0, B);
    for (let p = 0; p < 4; ++p) {
      for (let q = 0; q < 4; ++q) {
        var w = c[(p * 4) + q];
        var m = ((w / 4) | 0);
        var n = w - (m * 4);
        var k = n * o;
        var j = m * v;
        var e = q * o;
        var d = p * v;
        this.drawImage4Other(C, t, o, v, k, j, e, d);
      }
    }
  }
  drawImage4Other(g, e, c, h, j, i, f, d) {
    if ((c <= 0) || (h <= 0)) {
      return;
    }
    e.drawImage(g, j, i, c, h, f, d, c, h);
  }

}






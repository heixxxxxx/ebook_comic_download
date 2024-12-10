
class DlLsiteComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.scramble = {}
    this.imageList = []
    this.zipFlag = false
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
  getBookInfo() {
    let list = window.location.href.split("?")[1].split("&")
    list.forEach(item => {
      if (item.split("=")[0] == 'cgi') {
        this.baseUrl = decodeURIComponent(item.split("=")[1])
      } else if (item.split("=")[0] == 'param') {
        this.param = item.split("=")[1]
      }
    });
    var data_xhr = new XMLHttpRequest();
    data_xhr.open("GET", `${this.baseUrl}?mode=999&reqtype=1&file=&param=${this.param}&vm=4&time=` + new Date().getTime() % 1e7, true);
    //发送请求
    data_xhr.withCredentials = true;
    data_xhr.send();
    data_xhr.onreadystatechange = (e) => {
      if (data_xhr.readyState === 4 && data_xhr.status === 200) {
        var response = data_xhr.responseText;
        let Rxml = (new window.DOMParser()).parseFromString(response, "text/xml")
        data_xhr = new XMLHttpRequest();
        data_xhr.open("GET", `${this.baseUrl}?mode=7&reqtype=0&file=face.xml&param=${this.param}&vm=4&time=` + new Date().getTime() % 1e7, true);
        //发送请求
        data_xhr.send();
        data_xhr.onreadystatechange = (e) => {
          var response = data_xhr.responseText;
          let Rxml = (new window.DOMParser()).parseFromString(response, "text/xml")

          if (Rxml.getElementsByTagName('TocItem')[0]) {

            let topItem = Rxml.getElementsByTagName('TocItem')
            this.comicMsg["总页数"] = Rxml.getElementsByTagName('TotalPage')[0].innerHTML
            this.comicMsg["图片尺寸约"] = Rxml.getElementsByTagName('ContentFrame')[0].children[0].innerHTML + " * " + Rxml.getElementsByTagName('ContentFrame')[0].children[1].innerHTML
            this.comicMsg["目录"] = ""
            if (Rxml.getElementsByTagName('Scramble')) {
              this.scramble.width = Rxml.getElementsByTagName('Scramble')[0].children[0].innerHTML
              this.scramble.height = Rxml.getElementsByTagName('Scramble')[0].children[1].innerHTML
              for (let i = 0; i < topItem.length; i++) {
                this.comicMsg[topItem[i].children[1].innerHTML] = "p" + topItem[i].children[0].innerHTML
              }
              this.sendMsg(1)
            }

          }

        }
        this.param = encodeURIComponent(Rxml.getElementsByTagName('Content')[0].innerHTML)
      }
    }
  }
  getPage(page = 0) {
    if (page == this.comicMsg["总页数"]) {
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
    let fileName = page + ""
    for (let i = (page + "").length; i < 4; i++) {
      fileName = "0" + fileName
    }
    this.sendMsg(2, { nowPage: page })
    var data_xhr = new XMLHttpRequest();
    data_xhr.open("GET", `${this.baseUrl}?mode=8&file=${fileName}.xml&reqtype=0&vm=4&param=${this.param}&time=` + new Date().getTime() % 1e7, true);
    //发送请求
    // data_xhr.withCredentials = true;
    data_xhr.send();
    data_xhr.onreadystatechange = (e) => {
      if (data_xhr.readyState === 4 && data_xhr.status === 200) {
        var response = data_xhr.responseText;
        let Rxml = (new window.DOMParser()).parseFromString(response, "text/xml")
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
      }
    }


  }
  makeImg(page, fileName, key) {
    var data_xhr = new XMLHttpRequest();
    data_xhr.open("GET", `${this.baseUrl}?mode=1&file=${fileName}_0000.bin&reqtype=0&vm=4&param=${this.param}&time=` + new Date().getTime() % 1e7, true);
    //发送请求
    data_xhr.responseType = "arraybuffer";
    data_xhr.send();
    data_xhr.onreadystatechange = (e) => {
      if (data_xhr.readyState === 4 && data_xhr.status === 200) {
        var blob = new Blob([data_xhr.response]);
        let image = new Image()
        image.src = URL.createObjectURL(blob)
        image.setAttribute("crossOrigin", "use-credentials");
        image.onload = (e) => {
          let canvas = document.createElement("canvas")
          canvas.width = image.width
          canvas.height = image.height
          canvas.getContext("2d").drawImage(image, 0, 0);
          this.unscrambling(canvas, key)

          if (this.zipFlag) {
            zip.file(fileName + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
          } else {
            chrome.runtime.sendMessage({
              downloadUrl: canvas.toDataURL(),
              filename: fileName + ".jpg"
            });
          }
          setTimeout(() => {
            this.getPage(page + 1)
          }, 100)

        }

      }
    }

  }
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
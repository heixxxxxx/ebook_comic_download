

let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
class ValkyrieComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.baseUrl = ""
    this.zipFlag = false
    this.getInfo()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.getJson()
  }
  downloadZip() {
    this.zipFlag = true
    this.getJson()
  }
  //解码
  Ns(i) {
    var n = i.match(/^([^:]+):(\d+),(\d+)\+(\d+),(\d+)>(\d+),(\d+)$/);
    var r = n[1];
    return {
      resid: r,
      xsrc: parseInt(n[2], 10),
      ysrc: parseInt(n[3], 10),
      width: parseInt(n[4], 10),
      height: parseInt(n[5], 10),
      xdest: parseInt(n[6], 10),
      ydest: parseInt(n[7], 10)
    }
  }
  getInfo() {
    let metaList = document.getElementsByTagName("meta")
    for (let i = 0; i < metaList.length; i++) {
      if (metaList[i].getAttribute("property") == ("og:title")) {
        this.comicMsg['漫画名'] = metaList[i].getAttribute("content")

      } else if (metaList[i].getAttribute("property") == ("og:url")) {
        this.baseUrl = metaList[i].getAttribute("content")

      }
    }
    this.sendMsg(1)
  }
  draw(t, i, n, r, e, s, h, u, o, a) {
    let f = 0
    t.drawImage(i, n, r, e + f, s + f, h, u, o, a)
  }
  getJson(page = 1) {
    let pageName = page + ""
    for (let i = 0; i < 4; i++) {
      if (pageName.length == 4) break;
      pageName = "0" + pageName
    }
    fetch(this.baseUrl + "/data/" + pageName + `.ptimg.json`, {
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json()).then(r => {
      console.log(r)
      let coords = r.views[0].coords
      let image = new Image()
      image.src = this.baseUrl + "/data/" + r.resources.i.src
      image.setAttribute("crossOrigin", "use-credentials");
      image.onload = (e) => {
        canvas.width = image.width
        canvas.height = image.height
        for (var t, c = 0; c < coords.length; c++) {
          t = (this.Ns(coords[c]))
          this.draw(ctx, image, t.xsrc, t.ysrc, t.width, t.height, t.xdest, t.ydest, t.width, t.height)
        }

        if (this.zipFlag) {
          zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
        } else {
          chrome.runtime.sendMessage({
            downloadUrl: canvas.toDataURL(),
            filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
          });
        }
        this.sendMsg(2, {
          nowPage: page
        })
       
        setTimeout(() => {
          this.getJson(page + 1)
        }, 100)
      }

    }).catch(() => {
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
    })

  }
}
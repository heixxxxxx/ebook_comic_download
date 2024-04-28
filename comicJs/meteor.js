
  let canvas = document.createElement("canvas")
  let ctx = canvas.getContext('2d')
  class MeteorComic {
    constructor(webObj) {
      //this.comicMsg 是从网站中拿到的具体内容
      this.comicMsg = { "网站": webObj.name };
      //this.imageList 是图片列表
      this.imageList = []
      this.baseUrl = ""
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
      this.comicMsg['漫画名'] = document.getElementsByTagName("title")[0].innerText
      this.baseUrl = window.location.origin + window.location.pathname
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
  
          downloadByUrl(canvas.toDataURL(), page)
          this.sendMsg(2, {
            nowPage: page
          })
  
          setTimeout(() => {
            this.getJson(page + 1)
          }, 100)
        }
  
      }).catch(() => {
        this.sendMsg(4)
      })
  
    }
  }
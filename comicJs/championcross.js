for (var fr = [], vr = 0, pr = 0; pr < 4; pr++)
  for (var hr = 0; hr < 4; hr++)
    fr[vr++] = [pr, hr];
let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')

class ChampioncrossComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
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
    this.downloadImage(this.imageList)
  }
  getInfo() {
    let userId = document.getElementById("login_user_id") ? document.getElementById("login_user_id").innerText : 0
    userId = userId || '0'
    let url = `https://championcross.jp/book/episodeInfo?comici-viewer-id=${document.getElementById("comici-viewer").getAttribute("comici-viewer-id")}&isPreview=false`
    var r = new XMLHttpRequest;
    r.open("GET", url),
      r.responseType = "text",
      r.send()
    r.onload = (t) => {
      let eplist = (JSON.parse(r.responseText)).result
      let ep
      eplist.some(epItem => {
        if (epItem.id == document.getElementById("comici-viewer").getAttribute("comici-viewer-id")) {
          this.comicMsg['本集名'] = epItem.name
          this.comicMsg['页数'] = epItem.page_count
          ep = epItem
          return 0
        }
      });
      //page数据
      url = `https://championcross.jp/book/contentsInfo?user-id=${userId}&comici-viewer-id=${document.getElementById("comici-viewer").getAttribute("comici-viewer-id")}&page-from=0&page-to=${ep.page_count}`
      var r2 = new XMLHttpRequest;
      r2.open("GET", url),
        r2.responseType = "text",
        r2.send()
      r2.onload = (t) => {
        this.imageList = (JSON.parse(r2.responseText)).result
        this.sendMsg(1)
      }
    }
  }
  downloadImage(list, page = 0) {
    if (list.length == page) {
      this.sendMsg(4)
      return 0
    }
    let data = list[page]
    let image = new Image()
    image.crossOrigin = "anonymous"
    image.src = data.imageUrl
    image.onload = () => {
      let r = image.width
      let i = image.height
      canvas.width = r
      canvas.height = i
      for (var u = Math.floor(r / 4), d = Math.floor(i / 4), f = 0, v = function (e, t) {
        for (var n = e.length, r = [], i = t.replace(/\s+/g, "").slice(1).slice(0, -1).split(","), o = 0; o < n; o++)
          r.push(e[i[o]]);
        return r
      }(fr, data.scramble), p = 0; p < 4; p++)
        for (var h = 0; h < 4; h++) {
          var g = v[f][0]
            , m = v[f][1];
          ctx.drawImage(image, u * g, d * m, u, d, u * p, d * h, u, d),
            f++
        }
      a_dom.href = canvas.toDataURL()
      a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
      a_dom.click()
      this.sendMsg(2, {
        allPage: list.length,
        nowPage: page
      })
      setTimeout(() => {
        this.downloadImage(list, page + 1)
      }, 100)
    }
  }
}
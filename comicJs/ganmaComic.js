class GanmaComic {
  constructor(webObj) {
    this.comicMsg = {
      "网站": webObj.name
    };
    this.pageMsg = {}
    this.zipFlag = false
    this.imageList = []
    this.getComicInfo()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  //this.comicMsg 是从网站中拿到的具体内容
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({
      id,
      data: {
        comicMsg: this.comicMsg,
        ...msg
      }
    });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.makeUrls()
  }
  downloadZip() {
    this.zipFlag = true
    this.makeUrls()
  }
  getComicInfo() {
    let comicId = location.href.slice(0, location.href.indexOf("?")).split("/")[3]
    if ('comics' == comicId) {
      return 0
    }
    let epId = location.href.slice(0, location.href.indexOf("?")).split("/")[4]
    fetch(`https://ganma.jp/api/1.0/magazines/web/${comicId}`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-from": "https://ganma.jp/yariise/292132f0-67a0-11e8-aeb4-06e4e79605e7/24",
        "x-noescape": "true"
      },
      "method": "GET",
      "mode": "cors",
    }).then(r => r.json()).then(r => {
      r.root.items.some(epItem => {
        if (epItem.id == epId) {
          this.comicMsg["漫画名"] = epItem.series.title
          this.comicMsg["集数"] = epItem.title
          this.comicMsg["标题"] = epItem.subtitle
          this.comicMsg["作者"] = epItem.author.penName
          this.comicMsg["页数"] = epItem.page.files.length
          this.pageMsg = epItem.page
          this.sendMsg(1)
          return true
        }
      });
    })
  }
  makeUrls() {
    this.pageMsg.files.forEach(pageName => {
      this.imageList.push(this.pageMsg.baseUrl + pageName + "?" + this.pageMsg.token)
    })
    downloadByBgJs([...this.imageList], this)
  }
}
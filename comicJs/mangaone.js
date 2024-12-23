
injectedScriptToPage("/modules/manga-one.js")

class MangaoneComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
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
    downloadByBgJs(this.imageList, this)
  }
  //打包下载 
  downloadZip() {
    this.zipFlag = true
    downloadByBgJs(this.imageList, this)
  }
  getInfo() {
    if (document.getElementById("imageToContent")) {
      let list = JSON.parse(document.getElementById("imageToContent").innerText)
      list.forEach(element => {
        this.imageList.push(element.src)
      });
      this.comicMsg["标题"] = document.getElementsByTagName("title")[0].innerText
      this.comicMsg["页数"] = this.imageList.length
      this.sendMsg(1)
    } else {
      setTimeout(() => { this.getInfo() }, 500)
    }
  }
}
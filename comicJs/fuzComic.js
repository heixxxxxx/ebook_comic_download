injectedScriptToPage("/modules/fuz.js")
class FuzComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.downloadNum = 0
    this.getInfo()
    cleanCopyDom()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.sendMsg(2)
    this.updatedImg()
    this.downloadImg()
    this.addListen()
  }
  getInfo() {
    let p_domList = document.getElementsByTagName("p")
    for (let i = 0; i < p_domList.length; i++) {
      if (p_domList[i].className.indexOf("title__") != -1) {
        this.comicMsg["书名"] = p_domList[i].innerHTML
      }
    }

    let img_domList = document.getElementsByTagName("img")
    for (let i = 0; i < img_domList.length; i++) {
      if (img_domList[i].className.indexOf("_page") != -1) {
        this.comicMsg["图片尺寸"] = img_domList[i].getAttribute("width") + " * " + img_domList[i].getAttribute("height")
      }
    }
    this.sendMsg(1)
  }
  addListen() {
    let div_domList = document.getElementsByTagName("div")
    let div = ""
    for (let i = 0; i < div_domList.length; i++) {
      if (div_domList[i].className.indexOf("viewer_") != -1) {
        div = div_domList[i]
        break;
      }
    }
    listenDomChange(div, () => {
      this.updatedImg()
      this.downloadImg()
    })
  }
  updatedImg() {
    let img_domList = document.getElementsByTagName("img")
    for (let i = 0; i < img_domList.length; i++) {
      if (img_domList[i].className.indexOf("_page") != -1) {
        let page = img_domList[i].alt.split("_")[1] - 0
        if (!this.imageList[page]) {
          this.imageList[page] = (img_domList[i].src)
        }
      }
    }
  }
  downloadImg(page = 0) {
    if (page == this.imageList.length) {
      this.sendMsg(3)
      return 0
    }
    //下载
    if (this.imageList[page] && this.imageList[page] != "over") {
      downloadByUrl(this.imageList[page], page)
      URL.revokeObjectURL(this.imageList[page])
      this.sendMsg(2, {
        nowPage: page
      })
      this.imageList[page] = "over"
      setTimeout(() => {
        this.downloadImg(page + 1)
      }, 200)
    } else {
      this.downloadImg(page + 1)
    }
  }
}
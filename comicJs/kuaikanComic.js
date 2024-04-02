class KuaikanComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = {
      "网站": webObj.name
    };
    //this.imageList 是图片列表
    this.imageList = []
    this.getInfo()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
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
    downloadByBgJs([...this.imageList], this)
  }
  getInfo() {
    this.comicMsg["漫画名"] = document.getElementsByTagName("title")[0].innerText

    let imgDom = document.getElementsByTagName("img")

    for (let i = 0; i < imgDom.length; i++) {

      if (imgDom[i].getAttribute("data-src")) {
        this.imageList.push(imgDom[i].getAttribute("data-src"));
      }
    }
    this.comicMsg["页数"] = this.imageList.length
    this.sendMsg(1)
  }
}
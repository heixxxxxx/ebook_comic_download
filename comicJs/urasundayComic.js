class UrasundayComic {
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
    downloadByBgJs(this.imageList,this)
  }
  downloadZip() {
    this.zipFlag = true
zip = new JSZip();
    downloadByBgJs(this.imageList,this)
  }
  getInfo() {
    let jsList = document.getElementsByTagName("script")
    let metaList = document.getElementsByTagName("meta")
    let data
    for (let i = 0; i < metaList.length; i++) {
      if (metaList[i].getAttribute("property") == "og:title") {
        this.comicMsg["章节"] = metaList[i].getAttribute("content")
        break;
      }
    }
    for (let i = 0; i < jsList.length; i++) {
      if (jsList[i].innerHTML.indexOf("pages =") != -1) {
        data = jsList[i].innerHTML.slice(jsList[i].innerHTML.indexOf("pages =") + 8, jsList[i].innerHTML.indexOf("];") + 1)
        console.log(data)
        const regex = /src: '([^']*)'/g;
        let match;
        const matches = [];
        while ((match = regex.exec(data)) !== null) {
          // match[1] 包含了匹配的'匹配内容'部分
          this.imageList.push(match[1]);
        }

        break;
      }
    }
    console.log(this.imageList)
    this.comicMsg["页数"] = this.imageList.length
    this.sendMsg(1)
  }
}
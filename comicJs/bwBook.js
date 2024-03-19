
class BwComic {
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
    let injectedScript = document.createElement('script');
    injectedScript.src = chrome.runtime.getURL('/modules/bwInjectedScript.js');
    document.body.appendChild(injectedScript);
  }
  getInfo() {
    this.comicMsg["书名"] = document.getElementsByTagName("title")[0].innerText
    this.sendMsg(1)
  }
}
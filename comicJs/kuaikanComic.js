
class KuaikanComic {
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
    downloadByUrlList([...this.imageList], this)
  }
  getInfo() {
    let jsDom = document.getElementsByTagName("script")
    for (let i = 0; i < jsDom.length; i++) {
      if (jsDom[i].innerText.indexOf('window.__NUXT__=') != -1) {

        const regex = /url:"([^"]*)"/g;
        let matches;
        while ((matches = regex.exec(jsDom[i].innerText.split(",next_comic_info")[0])) !== null) {
          this.imageList.push(encodeURI(matches[1]));
        }
        this.sendMsg(2)

        break;
      }
    }
  }
}
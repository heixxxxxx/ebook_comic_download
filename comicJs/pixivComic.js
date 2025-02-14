class PixivComic {
  constructor(webObj) {
    this.comicMsg = { "网站": webObj.name };
    this.imageList = [];
    this.getInfo()
    this.zipFlag = false
  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //获取漫画信息
  getInfo() {
    let msgText = document.getElementsByTagName("title")[0].innerText
    let msgList = msgText.split(" ")
    msgList = msgList.filter(item => {
      if (item.trim().length > 1) {
        return item.trim()
      }
    })
    this.comicMsg['漫画名'] = msgList[2]
    this.comicMsg[`单集数`] = msgList[0]
    this.comicMsg[`标题`] = msgList[1]
    this.getImageList()
  }
  //获取图片列表
  getImageList() {
    for (let i = 0; ; i++) {
      let divDom = document.getElementById("page-" + i)
      if (!divDom) break;
      this.imageList.push(divDom.style['background-image'].match(/"([^]*)"/g)[0].slice(1, -1))
    }
    this.comicMsg['页数'] = this.imageList.length
    this.sendMsg(1)
  }
  //下载
  download() {
    downloadByUrlList([...this.imageList], this)
  }
  downloadZip() {
    this.zipFlag = true
zip = new JSZip();
    downloadByUrlList([...this.imageList], this)
  }

}

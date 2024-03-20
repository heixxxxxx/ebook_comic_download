
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

    //监听
    listenDomChange(document.getElementById("pageInfo"), () => {
      this.imageList = JSON.parse(document.getElementById("pageInfo").innerText)
      let num = null
      let text = ""
      this.imageList.forEach((item, i) => {
        if (item === true) {
          if (num === null) {
            num = i
            text = i + ""
          }
        } else {
          if (num + 1 == i) {
            text += (i - 1) + ","
            num = null
          }
        }
      })
      this.sendMsg(2, {
        msg: `已经下载：` + text
      })
    })
  }
  getInfo() {
    if (document.getElementsByTagName("title")[0]) {
      this.comicMsg["书名"] = document.getElementsByTagName("title")[0].innerText
      this.sendMsg(1)
    } else {
      setTimeout(() => { this.getInfo() }, 500)
    }

  }


}
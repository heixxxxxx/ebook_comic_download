
//网站信息
let webObj = {}
let originObj = {}
// 创建一个对象，封装全部的html修改方法进去
class htmlObj {
  //不支持
  cannotDown() {
    document.getElementById("loading").style.display = "none"
    let dom = document.createElement("p")
    dom.className = "msg-box-item"
    dom.innerText = "很抱歉，本扩展不支持该网站的下载，如果需要请联系开发人员"
    document.getElementById("msgBox").appendChild(dom)
  }
  //支持但不在阅读页（提示内容根据具体网站变化）
  supportButNotRead() {
    document.getElementById("loading").style.display = "none"
    let msgBox = document.getElementById("msgBox")
    let htmlText = ""
    htmlText += `<p class="msg-box-item" >支持该网站的下载，请点击到具体漫画页阅读页面下载</p>`
    htmlText += `<p class="msg-box-item" >开发时大部分网站仅用无料阅读内容，如购买内容无法下载，请联系开发者</p>`
    originObj.supportMsg.forEach(item => {
      htmlText += `<p class="msg-box-item" >${item}</p>`
    });
    msgBox.innerHTML += htmlText
  }
  // 0
  loading() {
    document.getElementById("msgBox").style.display = "block"
    document.getElementById("comicMsg").style.display = "none"
    document.getElementById("loading").style.display = "block"
    let msgList = document.getElementsByClassName("msg-box-item")
    for (let i = 0; i < msgList.length; i++) {
      msgList[i].parentElement.remove(msgList[i])
    }
    document.getElementById("msgBox").innerHTML += `<p class="msg-box-item" >支持下载，请稍后</p>`
    document.getElementById("msgBox").innerHTML += `<p class="msg-box-item" >如加载时间过长，请刷新页面重试，或者向开发者反馈问题</p>`
    webObj.loadingMsg.forEach(item => {
      document.getElementById("msgBox").innerHTML += `<p class="msg-box-item" >${item}</p>`
    });

  }
  //可以下载(显示漫画信息) 1
  downloadMsg(msg = {}) {
    this.updatedComicMsg(msg.comicMsg)
    //下载按钮
    document.getElementById("downloadBtn").style.display = "inline-block"
  }
  updatedComicMsg(msg = {}) {
    document.getElementById("msgBox").style.display = "none"
    document.getElementById("comicMsg").style.display = "block"
    let htmlText = ""
    for (let key in msg) {
      htmlText += `<p><span>${key}:</span><span>${msg[key]}</span></p>`
    }
    htmlText += `<p class="msg-box-item" >下载位置为浏览器设定的下载路径，如需修改，请打开浏览器设置-下载</p>`
    //提示内容
    webObj.downloadMsg.forEach(item => {
      htmlText += `<p class="msg-box-item" >${item}</p>`
    })
    document.getElementById("comicMsg").innerHTML = htmlText
  }
  //下载中 2
  downloading(msg = {}) {
    this.updatedComicMsg(msg.comicMsg)
    document.getElementById("downloadBtn").style.display = "none"
    document.getElementById("loadingNav").style.display = "flex"
    document.getElementById("downloading").className = "downloading downloading-ani"
    if (msg.allPage && msg.nowPage) {
      document.getElementById("downloadingText").innerText = `第${msg.nowPage}页/共${msg.allPage}页`
    } else if (msg.allPage) {
      document.getElementById("downloadingText").innerText = `正在下载...共${msg.allPage}页`
    } else if (msg.nowPage) {
      document.getElementById("downloadingText").innerText = `正在下载...第${msg.nowPage}页`
    } else {
      document.getElementById("downloadingText").innerText = msg.msg || "正在下载..."
    }
  }
  //下载中断 3
  downloadStop(msg = {}) {
    this.updatedComicMsg(msg.comicMsg)
    document.getElementById("downloading").className = "downloading"
    //定制提示
    if (webObj.loadStopMsg) {
      document.getElementById("downloadingText").innerText = webObj.loadStopMsg
    }
  }
  //下载完成 4
  downloadOver(msg = {}) {
    this.updatedComicMsg(msg.comicMsg)
    document.getElementById("downloading").className = "downloading"
    document.getElementById("downloadingText").innerText = `下载完成 √`
  }
}
// 发送消息到当前激活的标签页的content script
function sendMessage(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data);
  });
}
// 点击下载按钮
document.getElementById("downloadBtn").onclick = function () {
  sendMessage({ id: 1 })
  htmlPage.downloading();
}
//反馈
document.getElementById("qa").onclick = function () {
  chrome.tabs.create({ 'url': 'https://www.baidu.com' });
}

//popup页对象
let htmlPage = new htmlObj()
//获取激活标签页的url，匹配webList中的url
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let url = tabs[0].url;
  //匹配时匹配规则webList中的url
  webObj = webList.find(item => item.regex.test(url));
  
  originObj = webList.find(item => url.indexOf(item.originUrl) != -1);
  //匹配到了阅读页，可以直接下载的

  if (webObj) {
    htmlPage.loading()
    sendMessage({ id: 0, webObj: webObj })
  }
  //匹配到了可以下载的网站，提示去阅读页就能下
  else if (originObj) {
    
    htmlPage.supportButNotRead()
  }
  //匹配不上
  else {
    htmlPage.cannotDown()
  }
});

//接受content script的消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // 处理接收到的消息
  switch (message.id) {
    case 0: {
      //加载中
      htmlPage.loading();
      break;
    }
    case 1: {
      //显示信息
      htmlPage.downloadMsg(message.data);
      break;
    }
    case 2: {
      //下载中
      htmlPage.downloading(message.data);
      break;
    }
    case 3: {
      //下载中断
      htmlPage.downloadStop(message.data);
      break;
    } case 4: {
      //下载完成
      htmlPage.downloadOver(message.data);
      break;
    }

  }

});
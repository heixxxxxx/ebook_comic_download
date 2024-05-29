if (window.location.href.indexOf('bviewer') != -1) {
  injectedScriptToPage("/modules/yahoo.js")
} else if (window.location.href.indexOf('prod-contents-br-page') != -1) {

  window.addEventListener('message', (event) => {
    if (event.data.key == 'heixxx-pagesmsg') {
      JSON.parse(event.data.data).forEach(element => {
        downloadImg(element)
      });

    } else if (event.data.key == 'heixxx-pagemsg') {
      downloadImg(JSON.parse(event.data.data))
    }
  });
  parent.postMessage({ key: 'heixxx-start' }, '*');
}



class YahooComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };

    this.checkMsg()
  }
  // 检查注入脚本运行情况 
  checkMsg() {
    if (document.getElementById('ecdPage') && document.getElementById('ecdPage').innerText.length) {
      let iframeDom = document.createElement(
        "iframe"
      )
      iframeDom.style.display = "none"
      iframeDom.src = JSON.parse(document.getElementById('ecdPage').innerText).url
      document.body.appendChild(iframeDom)
      this.iframeDom = iframeDom
      window.addEventListener('message', (event) => {
        if (event.data.key == 'heixxx-start') {
          this.sendMsg(1)
        }
      });
    }
  }

  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    if (this.iframeDom) {
      this.iframeDom.contentWindow.postMessage({ key: 'heixxx-pagesmsg', data: document.getElementById('ecdP').innerText }, '*');
      document.body.removeChild(document.getElementById('ecdP'))
      this.sendMsg(2)
      listenDomChange(document.getElementById('ecdPage'), () => {

        this.iframeDom.contentWindow.postMessage({ key: 'heixxx-pagemsg', data: document.getElementById('ecdPage').innerText }, '*');
      })
    }
  }
}

let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
let page = 0
function downloadImg(data) {
  let image = new Image()
  image.src = data.url
  image.onload = (e) => {
    canvas.width = data.width
    canvas.height = data.height
    for (let i = 0; i < data.list.length; i++) {
      ctx.drawImage(image, ...data.list[i])
    }
    chrome.runtime.sendMessage({
      downloadUrl: canvas.toDataURL(),
      filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
    });
    page++
  }
}




class DongmanComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.urlList = []
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
    let iframeDom = document.createElement(
      "iframe"
    )
    iframeDom.style.display = "none"
    iframeDom.src = this.urlList[0] + "&keys=heixxx"
    document.body.appendChild(iframeDom)

    window.addEventListener('message', (event) => {
      if (event.data.page) {
        let page = event.data.page * 1
        if (page >= this.urlList.length) {
          this.sendMsg(4)
        } else {
          this.sendMsg(2, {
            allPage: this.urlList.length,
            nowPage: page
          })
        }

      } else if (event.data.keys == 'heixxx') {
        iframeDom.contentWindow.postMessage({ urls: this.urlList }, '*');
      }

    });
  }
  getInfo() {
    this.comicMsg['漫画名'] = document.getElementsByTagName("title")[0].innerText
    this.imgList = document.getElementsByClassName("_images")
    this.comicMsg['页数'] = this.imgList.length
    for (let i = 0; i < this.imgList.length; i++) {
      this.urlList.push(this.imgList[i].getAttribute('data-url'))
    }
    this.sendMsg(1)
  }

}



if (window.location.search) {

  let searchList = window.location.search.slice(1).split("&")
  searchList.forEach(item => {

    if (item.split("=")[0] == 'keys') {
      if (item.split("=")[1] == 'heixxx') {
        window.addEventListener('message', (event) => {
          if (event.data.urls) {

            download(event.data.urls)
          }
        });
        parent.postMessage({ keys: 'heixxx' }, '*');
      }
    }
  })
}

function download(url, page = 0) {
  if (page >= url.length) {
    parent.postMessage({ page: page + '' }, '*');
    return 0
  }
  a_dom.href = url[page]
  a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
  a_dom.click()
  parent.postMessage({ page: page + '' }, '*');
  setTimeout(() => {
    download(url, page + 1)
  }, 200)

}

class GanganComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.zipFlag = false
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
    downloadByBgJs([...this.imageList], this)
  }
  downloadZip() {
    this.zipFlag = true
    downloadByBgJs([...this.imageList], this)
  }
  getInfo() {
    let data = JSON.parse(document.getElementById("__NEXT_DATA__").innerText)
    if (data.props) {
      data = data.props.pageProps
      this.comicMsg["漫画名"] = data.data.titleName
      this.comicMsg["章节名"] = data.data.chapterName
      let allPage = 0
      data.data.pages.forEach(item => {
        if (item.image) {
          allPage++
          this.imageList.push('https://www.ganganonline.com/' + item.image.imageUrl)
        }
      });
      this.comicMsg["页数"] = allPage
      this.sendMsg(1)
    } else {
      let buildId = JSON.parse(document.getElementById("__NEXT_DATA__").innerText).buildId
      let url = window.location.href.replace("/title", `/_next/data/${buildId}/title`)
      url += '.json'
      fetch(url, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\""
        },
        "referrer": "",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
      })
        .then(response => response.json())
        .then(json => {
          let data = json.pageProps
          this.comicMsg["漫画名"] = data.data.titleName
          this.comicMsg["章节名"] = data.data.chapterName
          this.comicMsg["页数"] = data.data.pages.length
          data.data.pages.forEach(item => {
            this.imageList.push('https://www.ganganonline.com/' + item.image.imageUrl)
          });
          this.sendMsg(1)
        })
        .catch(error => {
          console.log(error)
          console.error("发生错误，无法请求json文件,请检查网址或稍后再试");
        });

    }

  }
}
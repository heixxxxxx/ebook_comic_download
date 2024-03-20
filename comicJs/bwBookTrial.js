class BwTrialComic {
  constructor(webObj) {
    this.comicMsg = {
      "网站": webObj.name
    };
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
    downloadByFetch([...this.imageList], 0, this)
  }
  getInfo() {
    //获取cId
    let cId = window.location.href.split("cid=")[1]
    cId = cId.slice(0, cId.indexOf("&"))
    //凭证
    let ZO3 = Math.floor(100000000 * Math.random())
    let wO3 = ("00000000" + String(ZO3)).slice(-8);
    let bid = new Date().getTime() + wO3;
    fetch(window.location.origin + "/trial-page/c?cid=" + cId + "&BID=" + bid, {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json()).then(r => {
      this.comicMsg['书名'] = r.cti
      let data = ""
      for (let key in r.auth_info) {
        data += `${key}=${r.auth_info[key]}&`

      }
      let url = r.url
      fetch(url + "configuration_pack.json?" + data, {
        "headers": {
          "accept": "*/*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Microsoft Edge\";v=\"122\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site"
        },

        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      }).then(r => r.json()).then(r => {
        r.configuration.contents.forEach(element => {
          this.imageList.push(url + element.file + "/0." + element.type + "?" + data)
        });
        this.comicMsg['页数'] = this.imageList.length
        this.sendMsg(1)
      })
    });






  }
}
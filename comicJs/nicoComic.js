class NicoComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = {
      "网站": webObj.name
    };
    //this.imageList 是图片列表
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
    this.loadImage()
  }
  getInfo() {
    let jsList = document.getElementsByTagName("script")
    for (let i = 0; i < jsList.length; i++) {
      if (jsList[i].innerText.indexOf("args") != -1) {

        let info = JSON.parse(jsList[i].innerText.split("=")[1].split(";")[0])
        info.pages.forEach(item => {
          this.imageList.push(item.url)
        });
        break;
      }
    }
    this.comicMsg["作品名"] = document.getElementsByClassName("manga_title")[0].children[0].innerText
    this.comicMsg["作者"] = document.getElementsByClassName("author_name")[0].innerText
    this.comicMsg["集数"] = document.getElementsByClassName("episode_title")[0].innerText
    this.comicMsg["页数"] = this.imageList.length

    this.sendMsg(1)
  }
  loadImage(page = 0) {
    if (page == this.imageList.length) {
      this.sendMsg(4)
      return 0
    }
    var n = new XMLHttpRequest
    this.getFromCORSRequest(n, this.imageList[page], page)
  }

  getFromCORSRequest(e, n, page) {
    var i = this.getKeyFromUrl(n);
    e.open("GET", n, !0),
      e.responseType = "arraybuffer"
    e.onload = (r) => {
        var t = new Uint8Array(e.response);
        t = this.decrypt(t, i)

        t = "data:image/" + this.getDataType(t) + ";base64," + this.toBase64String(t);
        chrome.runtime.sendMessage({
          downloadUrl: t,
          filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
        });

        this.sendMsg(2, {
          nowPage: page,
          allPage: this.imageList.length
        })
        setTimeout(() => {
          this.loadImage(page + 1)
        }, 100)
      },
      e.send()
  }
  decrypt(e, t) {
    for (var n = [], r = 0; r < 8; r++)
      n.push(parseInt(t.substr(2 * r, 2), 16));
    for (r = 0; r < e.length; r++)
      e[r] = e[r] ^ n[r % 8];
    return e
  }
  getKeyFromUrl(e) {
    e = e.match("/image/([a-z0-9_]+)/");
    return null === e ? "" : e[1].split("_")[0]
  }

  getDataType(e) {
    var t = null,
      n = e.length;
    return 255 === e[0] && 216 === e[1] && 255 === e[n - 2] && 217 === e[n - 1] ? t = "jpg" : 137 === e[0] && 80 === e[1] && 78 === e[2] && 71 === e[3] ? t = "png" : 71 === e[0] && 73 === e[1] && 70 === e[2] && 56 === e[3] && (t = "gif"),
      t
  }
  toBase64String(e) {
    for (var t = "", n = e.length, r = 0; r < n; r++)
      t += String.fromCharCode(e[r]);
    return btoa(t)
  }

  getDataType(e) {
    var t = null,
      n = e.length;
    return 255 === e[0] && 216 === e[1] && 255 === e[n - 2] && 217 === e[n - 1] ? t = "jpg" : 137 === e[0] && 80 === e[1] && 78 === e[2] && 71 === e[3] ? t = "png" : 71 === e[0] && 73 === e[1] && 70 === e[2] && 56 === e[3] && (t = "gif"),
      t
  }

}
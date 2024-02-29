
class BiliComic {
  constructor(webObj) {
    this.epId = '';
    this.comicMsg = { "网站": webObj.name };
    this.imageList = [];
    this.getEpId()
  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载
  download() {
    this.getImgToken()
  }
  // 通过地址栏的链接获取到这一话的id
  getEpId() {
    let url = location.href.slice(0, location.href.indexOf("?"));
    this.epId = url.split("/")[url.split("/").length - 1];
    this.getComicInfo()
  }
  getComicInfo() {
    fetch("https://manga.bilibili.com/twirp/comic.v1.Comic/GetEpisode?device=pc&platform=web", {
      "headers": {
        "content-type": "application/json;charset=UTF-8",
        "referrerPolicy": "strict-origin-when-cross-origin",
      },
      "body": JSON.stringify({ id: this.epId }),
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    })
      .then(r => r.json())
      .then(response => {
        this.comicMsg['漫画名'] = response.data.comic_title
        this.comicMsg[`单集数`] = "第" + response.data.short_title + "话"
        this.comicMsg[`标题`] = response.data.title
        this.getImageList()
      })
  }
  // 获取图片列表 (发送漫画信息)
  getImageList() {
    fetch("https://manga.bilibili.com/twirp/comic.v1.Comic/GetImageIndex?device=pc&platform=web", {
      "headers": {
        "content-type": "application/json;charset=UTF-8",
        "referrerPolicy": "strict-origin-when-cross-origin",
      },
      "body": JSON.stringify({ epId: this.epId }),
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    })
      //这是一种异步写法，then发生在上面的fetch请求有返回结果以后，response就是返回值，.json是把返回值转成json对象
      .then(r => r.json())
      .then(response => {
        // 获得res中的图片地址信息
        this.imageList = response.data.images
        this.comicMsg[`总页数`] = this.imageList.length <= 2 ? '未购买' : this.imageList.length
        //发送消息
        this.sendMsg(1)
      })
  }
  //通过图片列表的地址，获取真实图片链接和token
  getImgToken(imageList = this.imageList) {
    let imgList = []
    for (let i = 0; i < imageList.length; i++) {
      imgList.push(imageList[i].path)
    }
    fetch("https://manga.bilibili.com/twirp/comic.v1.Comic/ImageToken?device=pc&platform=web", {
      "headers": {
        "content-type": "application/json;charset=UTF-8",
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": JSON.stringify({ urls: JSON.stringify(imgList) }),
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json())
      .then(r => {
        this.sendMsg(2, { allPage: imageList.length, nowPage: 0 })
        let downloadUrlList = []
        //循环一下，把每个地址组合
        for (let i = 0; i < r.data.length; i++) {
          //下载 
          downloadUrlList.push(r.data[i].url + "?token=" + r.data[i].token)
        }
        this.downloadImg(downloadUrlList)
      })
  }
  downloadImg(url, page = 1) {
    if (url.length == 0) {
      this.sendMsg(4)
      return 0
    }
    this.sendMsg(2, { allPage: this.imageList.length, nowPage: page })
    fetch(url[0]).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
      a_dom.href = URL.createObjectURL(blob)
      a_dom.download = page < 10 ? '0' + page + ".jpg": page + ".jpg";
      a_dom.click()
      url.splice(0, 1)
      this.downloadImg(url, page + 1)
    })

  }
}

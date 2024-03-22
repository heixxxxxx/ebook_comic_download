class CmoaComic {
  constructor(webObj) {
    this.comicMsg = { "网站": webObj.name };
    this.imageList = [];
    this.downloadFlag = false
    this.getInfo()
    this.watchPageChange()
  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //获取漫画信息
  getInfo() {
    let text = document.getElementsByTagName("title")[0].innerText.split("｜")[0].trim()
    text = text.replace("無料・試し読みページ", "").trim()
    let page = document.getElementById("menu_slidercaption").innerText.split("/")[1] - 0
    this.comicMsg['漫画名'] = text
    this.comicMsg['页数'] = page
    this.imageList.length = page

    this.sendMsg(1)
  }
  //获取图片列表
  getImageList() {

    let divDomList = document.getElementById("content").children
    for (let i = 0; i < divDomList.length; i++) {
      if (divDomList[i].id && divDomList[i].id.indexOf("content-") != -1) {
        let imgSize = []
        imgSize.push(divDomList[i].offsetWidth, divDomList[i].offsetHeight)
        let page = divDomList[i].id.slice(divDomList[i].id.indexOf("-p") + 2) * 1 - 1
        if (this.imageList[page]) {
          if (i == divDomList.length - 1) {

            this.downloadImg()
          }
          continue;
        }
        //page内容
        if (divDomList[i].children[0] && divDomList[i].children[0].children[0]) {
          this.imageList[page] = {}
          let partDom = divDomList[i].children[0].children
          this.imageList[page].imgs = []
          this.imageList[page].position = []
          for (let i = 0; i < partDom.length; i++) {
            //这里为了保证下载成功率，还是那src数据自己加载吧
            this.imageList[page].position.push(partDom[i].style.inset.split("%")[0] / 100)
            this.imageList[page].imgs.push(partDom[i].children[0].src)
          }
          puzzleToCanvas(this.imageList[page].imgs, imgSize, this.imageList[page].position).then(r => {
            this.imageList[page].canvasData = r
            if (i == divDomList.length - 1) {
              this.downloadImg()
            }
          })
        }
      }
    }
  }
  //下载
  download() {
    this.downloadFlag = true
    this.getImageList()
  }
  //实际下载
  downloadImg() {
    let list = this.imageList
    let page = 0
    list.forEach(item => {
      if (item && item.canvasData === null) page++
    });
    //完成
    console.log(page)
    if (page == list.length) {
      this.downloadFlag = false
      this.comicMsg['已下载'] = page + "/" + list.length
      this.sendMsg(4)
      return 0
    }
    let ifDownload = list.some((item, i) => {
      if (item && item.canvasData) {
        downloadByUrl(item.canvasData, i)
        item.canvasData = null

        this.sendMsg(2, { allPage: this.imageList.length, nowPage: page + 1 })
        this.downloadImg()
        return true
      }
    });
    if (!ifDownload) {
      this.comicMsg['已下载'] = page + "/" + list.length
      this.sendMsg(3)
    } else {
      console.log(this.imageList)
    }
  }
  //监听页面变化
  watchPageChange() {
    listenDomChange(document.getElementsByClassName("pages")[0], () => {
      if (!this.downloadFlag) return 0
      this.getImageList()
    })

  }

}

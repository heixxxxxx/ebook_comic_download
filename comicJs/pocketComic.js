class PocketComic {
  constructor(webObj) {
    this.comicMsg = {
      "网站": webObj.name
    };
    this.imageList = []
    this.getComicInfo()
    this.zipFlag = false
    this.cleanCopyDom()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  //this.comicMsg 是从网站中拿到的具体内容
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
    this.loadImage([...this.imageList])
  }
  downloadZip() {
    this.zipFlag = true
    this.loadImage([...this.imageList])
  }
  //获取网页上的漫画信息（从script的属性拿）
  getComicInfo() {
    let comicInfo = JSON.parse(decodeURIComponent(document.documentElement.getAttribute("data-gtm-data-layer"))).episode
    let epInfo = JSON.parse(decodeURIComponent(document.getElementById("episode-json").getAttribute("data-value"))).
    readableProduct
    this.comicMsg["漫画名"] = comicInfo.series_title
    this.comicMsg["单集"] = comicInfo.episode_title
    this.comicMsg["页数"] = 0
    epInfo.pageStructure.pages.forEach(page => {
      if (page.src) {
        this.comicMsg["页数"]++
        this.imageList.push(page.src)
      }
    });

    this.sendMsg(1)


  }
  solve(puzzledImage, canvas, cell_width, cell_height, width, height) {
    this.drawImage(puzzledImage, canvas, 0, 0, width, height, 0, 0);
    for (let e = 0; e < 4 * 4; e++) {
      const t = Math.floor(e / 4) * cell_height,
        i = e % 4 * cell_width,
        r = Math.floor(e / 4),
        n = e % 4 * 4 + r,
        s = n % 4 * cell_width,
        o = Math.floor(n / 4) * cell_height;
      this.drawImage(puzzledImage, canvas, i, t, cell_width, cell_height, s, o)
    }

  }
  drawImage(puzzledImage, canvas, e, t, i, r, s, o) {
    const a = canvas.getContext("2d");
    a ? (a.imageSmoothingEnabled = !1,
      a.drawImage(puzzledImage, e, t, i, r, s, o, i, r)) : l || ((0,
        n.T)(new Error("Failed to getContext")),
      l = !0)
  }
  loadImage(urlList, page = 0) {
    if (page >= urlList.length) {
      if (this.zipFlag) {
        zip.generateAsync({ type: "blob" })
          .then((content) => {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = (this.comicMsg['漫画名'] || this.comicMsg['书名'] || '下载') + ".zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.sendMsg(4)
          });
      } else {
        this.sendMsg(4)
      }
      return 0
    }
    let canvas = document.createElement("canvas")
    let puzzledImage = new Image()
    puzzledImage.src = urlList[0]
    puzzledImage.setAttribute("crossOrigin", "anonymous");
    let cell_width
    let cell_height
    puzzledImage.onload = () => {
      canvas.width = puzzledImage.width
      canvas.height = puzzledImage.height
      cell_width = Math.floor(puzzledImage.width / (4 * 8)) * 8
      cell_height = Math.floor(puzzledImage.height / (4 * 8)) * 8
      this.solve(puzzledImage, canvas, cell_width, cell_height, puzzledImage.width, puzzledImage.height)

      if (this.zipFlag) {
        zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
      } else {
        chrome.runtime.sendMessage({
          downloadUrl: canvas.toDataURL(),
          filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
        });
      }

      urlList.splice(0, 1)
      this.sendMsg(2, {
        allPage: this.imageList.length,
        nowPage: page
      })
      setTimeout(() => {
        this.loadImage(urlList, page + 1)
      }, 200)

    }
  }
  cleanCopyDom() {
    let sty = document.createElement('style');
    sty.innerText = '.image-container .page-image, .image-container canvas{user-select:auto;-webkit-user-select:auto;-webkit-touch-callout:auto;pointer-events:auto}';
    document.body.appendChild(sty);
  }


}
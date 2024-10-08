class JumpComic {
  constructor(webObj) {

    this.comicMsg = {
      "网站": webObj.name
    }
    this.width
    this.height
    this.cell_width
    this.cell_height
    this.solvedImage
    this.puzzledImage
    this.zipFlag = false
    this.imageList = []
    this.getInfo()
    this.cleanCopyDom()
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
    this.loadimage()
  }


  downloadZip() {
    this.zipFlag = true
    this.loadimage()
  }  //获取漫画json数据
  getInfo() {
    let data = JSON.parse(document.getElementById("episode-json").getAttribute("data-value"))

    this.comicMsg["漫画名"] = (data.readableProduct.title)
    data.readableProduct.pageStructure.pages.forEach(page => {
      if (page.src) {
        if (this.imageList.length == 0) {
          this.comicMsg["图片尺寸约"] = page.width + " * " + page.height
        }
        this.imageList.push(page.src)
      }
    });
    this.comicMsg["页数"] = this.imageList.length
    this.sendMsg(1)
  }
  loadimage(page = 0) {
    if (page >= this.imageList.length) {
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
    let image = new Image()
    image.src = this.imageList[page]
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = () => {
      this.initMembers(image)
      this.solve()
      this.sendMsg(2, {
        allPage: this.imageList.length,
        nowPage: page
      })
      if (this.zipFlag) {
        zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", this.solvedImage.toDataURL().split(',')[1], { base64: true });
      } else {
        chrome.runtime.sendMessage({
          downloadUrl: this.solvedImage.toDataURL(),
          filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
        });
      }
      setTimeout(() => {
        this.loadimage(page + 1)
      }, 200)

    }
  }

  solve() {
    this.drawImage(0, 0, this.width, this.height, 0, 0);
    for (let e = 0; e < 4 * 4; e++) {
      const t = Math.floor(e / 4) * this.cell_height,
        i = e % 4 * this.cell_width,
        r = Math.floor(e / 4),
        n = e % 4 * 4 + r,
        s = n % 4 * this.cell_width,
        o = Math.floor(n / 4) * this.cell_height;
      this.drawImage(i, t, this.cell_width, this.cell_height, s, o)
    }
  }

  drawImage(e, t, i, r, s, o) {
    const a = this.solvedImage.getContext("2d");
    a ? (a.imageSmoothingEnabled = !1,
      a.drawImage(this.puzzledImage, e, t, i, r, s, o, i, r)) : l || ((0,
        n.T)(new Error("Failed to getContext")),
        l = !0)
  }


  initMembers(e) {
    this.puzzledImage = e
    this.width = e.naturalWidth
    this.height = e.naturalHeight
    this.cell_width = Math.floor(this.width / (4 * 8)) * 8
    this.cell_height = Math.floor(this.height / (4 * 8)) * 8
    this.solvedImage = document.createElement("canvas")
    this.solvedImage.width = this.width
    this.solvedImage.height = this.height
  }
  cleanCopyDom() {
    let sty = document.createElement('style');
    sty.innerText = '.image-container .page-image, .image-container canvas{user-select:auto;-webkit-user-select:auto;-webkit-touch-callout:auto;pointer-events:auto}';
    document.body.appendChild(sty);
  }
}
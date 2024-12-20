
let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
class DaysComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.zipFlag = false
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
    this.makeImage()
  }
  downloadZip() {
    this.zipFlag = true
    this.makeImage()
  }
  getInfo() {
    let info = JSON.parse(document.getElementById("episode-json").dataset.value).readableProduct
    this.comicMsg["漫画名"] = info.series.title
    this.comicMsg["集数"] = info.title
    info.pageStructure.pages.forEach(item => {
      if (item.src) this.imageList.push(item.src)
    });
    this.comicMsg["页数"] = this.imageList.length
    this.sendMsg(1)
  }
  makeImage(page = 0) {
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
    if (this.zipFlag) {
      fetch(this.imageList[page])
        .then(res => res.blob()).then(r => {
          let img = new Image()
          img.src = URL.createObjectURL(r)
          img.onload = () => {
            this.solve(img)
            fetch(canvas.toDataURL()).then(res => res.blob()).then(blob => {
              zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", blob);
              this.sendMsg(2, {
                allPage: this.imageList.length,
                nowPage: page
              })
              setTimeout(() => {
                this.makeImage(page + 1)
              }, 200)
            })
          }
        })

    } else {
      fetch(this.imageList[page])
        .then(res => res.blob()).then(r => {
          let img = new Image()
          img.src = URL.createObjectURL(r)
          console.log(img.src)
          img.onload = () => {
            this.solve(img)
            chrome.runtime.sendMessage({
              downloadUrl: canvas.toDataURL(),
              filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
            });
            this.sendMsg(2, {
              allPage: this.imageList.length,
              nowPage: page
            })
            setTimeout(() => {
              this.makeImage(page + 1)
            }, 200)
          }
        })


    }

  }
  solve(image) {

    let width = image.width
    let height = image.height
    canvas.width = width
    canvas.height = height
    let cell_width = Math.floor(width / (4 * 8)) * 8
    let cell_height = Math.floor(height / (4 * 8)) * 8
    this.drawImagef(image, 0, 0, width, height, 0, 0);
    for (let e = 0; e < 4 * 4; e++) {
      const t = Math.floor(e / 4) * cell_height
        , i = e % 4 * cell_width
        , r = Math.floor(e / 4)
        , n = e % 4 * 4 + r
        , s = n % 4 * cell_width
        , o = Math.floor(n / 4) * cell_height;
      this.drawImagef(image, i, t, cell_width, cell_height, s, o)
    }

  }
  drawImagef(image, e, t, i, r, s, o) {
    ctx.drawImage(image, e, t, i, r, s, o, i, r)
  }
}
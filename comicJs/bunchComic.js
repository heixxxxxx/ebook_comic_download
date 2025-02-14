let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
let image = new Image();
class BunchComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.zipFlag = false
    this.getJson()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.drawImg()

  }
  downloadZip() {
    this.zipFlag = true
zip = new JSZip();
    this.drawImg()
  }
  getJson() {
    if (!document.getElementById("episode-json")) {
      setTimeout(() => {
        this.getJson()
      }, 100)
      return 0
    }
    let data = JSON.parse(document.getElementById("episode-json").getAttribute("data-value"))
    this.comicMsg["漫画名"] = data.readableProduct.series.title
    this.comicMsg["章节名"] = data.readableProduct.title
    console.log(data)
    data.readableProduct.pageStructure.pages.forEach(item => {
      if (item.src) {
        this.comicMsg["图片尺寸"] = item.width + " * " + item.height
        this.imageList.push(item.src)
      }

    });
    this.comicMsg["页数"] = this.imageList.length
    this.sendMsg(1)
  }
  drawImg(page = 0) {
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
    fetch(this.imageList[page]).then((e => e.blob())).then(r => {
      image.src = URL.createObjectURL(r)
    })
    image.onload = () => {

      let width = image.width
      let height = image.height
      canvas.width = width
      canvas.height = height
      let cell_width = Math.floor(width / (4 * 8)) * 8
      let cell_height = Math.floor(height / (4 * 8)) * 8
      ctx.drawImage(image, 0, 0, width, height);
      for (let e = 0; e < 4 * 4; e++) {
        const t = Math.floor(e / 4) * cell_height
          , i = e % 4 * cell_width
          , r = Math.floor(e / 4)
          , n = e % 4 * 4 + r
          , s = n % 4 * cell_width
          , o = Math.floor(n / 4) * cell_height;
        ctx.drawImage(image, i, t, cell_width, cell_height, s, o, cell_width, cell_height)
      }
      if (this.zipFlag) {
        zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
      } else {
        chrome.runtime.sendMessage({
          downloadUrl: canvas.toDataURL(),
          filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
        });
      }


      this.sendMsg(2, {
        allPage: this.imageList.length,
        nowPage: page
      })


      setTimeout(() => {
        this.drawImg(page + 1)
      }, 200)
    }

  }
}
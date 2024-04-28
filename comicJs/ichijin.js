let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
class IchijinComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
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
    this.draw()
  }
  getInfo() {
    let info = JSON.parse(document.getElementById("__NEXT_DATA__").textContent).props.pageProps.fallbackData
    this.comicMsg["漫画名"] = info.comic_title
    this.comicMsg["集数"] = info.episode_title
    this.comicMsg["页数"] = info.pages.length
    this.imageList = info.pages
    this.sendMsg(1)
  }
  draw(page = 0) {
    if (page >= this.imageList.length) {
      this.sendMsg(4)
      return 0
    }
    fetch(this.imageList[page].page_image_url).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
      let image = new Image()
      image.src = URL.createObjectURL(blob)

      image.onload = () => {
        canvas.width = image.width
        canvas.height = image.height
        let e = image
        let t = ctx
        let n = this.imageList[page].drm_hash
        let [i, r, ...o] = this.iP(n)
          , { naturalWidth: a, naturalHeight: s } = e
          , l = i * r
          , u = Math.floor((a - a % 8) / i)
          , c = Math.floor((s - s % 8) / r);
        if (l !== o.length)
          throw Error("drmHash is invalid.");
        t.drawImage(e, 0, 0, a, s);
        for (let n = 0; n < l; n += 1) {
          let r = o[n]
            , a = r % i
            , s = Math.floor(r / i)
            , l = n % i
            , d = Math.floor(n / i);
          t.drawImage(e, a * u, s * c, u, c, l * u, d * c, u, c)
        }
        chrome.runtime.sendMessage({
          downloadUrl: canvas.toDataURL(),
          filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
        });
        this.sendMsg(2, {
          allPage: this.imageList.length,
          nowPage: page
        })
        setTimeout(() => {
          this.draw(page + 1)
        }, 200)
      }
    })

  }

  iP(e) {
    let t = atob(e)
      , n = [];
    for (let e = 0; e < t.length; e += 1)
      n[e] = t.charCodeAt(e);
    return n
  }
}
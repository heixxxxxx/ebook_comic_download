class CoronaComic {
  constructor(webObj) {
    this.comicMsg = { "网站": webObj.name };
    this.imageList = [];
    this.getInfo()
  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //获取漫画信息
  getInfo() {
    let id = window.location.href.match(/\d+/)[0]
    fetch(`https://api.to-corona-ex.com/episodes/${id}/begin_reading`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "if-none-match": "W/\"c62f103137476a798dc9792b7b41fe1a\"",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-api-environment-key": "K4FWy7Iqott9mrw37hDKfZ2gcLOwO-kiLHTwXT8ad1E="
      },
      "referrer": "https://to-corona-ex.com/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    }).then(response => response.json()).then(r => {
      this.comicMsg['漫画名'] = r.comic_title
      this.comicMsg['单集'] = r.episode_title
      this.comicMsg['页数'] = r.pages.length
      this.sendMsg(1)
      this.imageList = [...r.pages]

    })

  }
  //还原图片
  drawImg(page = 0) {
    if (page == this.imageList.length) {
      this.sendMsg(4)
      return 0
    }
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    image.src = this.imageList[page].page_image_url
    image.onload = () => {
      let canvas = document.createElement("canvas")
      //绘制
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d');
      let t = atob(this.imageList[page].drm_hash)
      let n = [];
      for (let e = 0; e < t.length; e += 1) {
        n[e] = t.charCodeAt(e)
      }
      let [r, i, ...o] = n
        , { naturalWidth: a, naturalHeight: s } = image
        , l = r * i
        , c = Math.floor((a - a % 8) / r)
        , u = Math.floor((s - s % 8) / i);
      //绘制
      for (let n = 0; n < l; n++) {

        let i = o[n]
          , a = i % r
          , s = Math.floor(i / r)
          , l = n % r
          , d = Math.floor(n / r);
        ctx.drawImage(image, a * c, s * u, c, u, l * c, d * u, c, u)
      }
      downloadByUrl(canvas.toDataURL("image/png"), page)
      this.sendMsg(2, { allPage: this.imageList.length, nowPage: page + 1 })
      this.drawImg(page + 1)
    }
  }
  //下载
  download() {
    this.drawImg()
  }

}

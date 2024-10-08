let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')
class DmmFreeComic {
  constructor(webObj) {
    this.webObj = webObj
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.imageData = {}
    this.zipFlag = false
    this.getComicInfo()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.loadImage()
  }
  downloadZip() {
    this.zipFlag = true
    this.loadImage()
  } getComicInfo() {
    let u1 = ""
    let u2 = ""
    this.webObj.cookies.forEach(element => {
      if (element.name == 'u1') {
        u1 = element.value
      } else if (element.name == 'u2') {
        u2 = element.value
      }
    });

    let query = window.location.href.split("?")[1]
    fetch(`${window.location.origin}/viewerapi/auth/?${query}&u1=${u1}&u2=${u2}`, {
      "headers": {
        "accept": "*/*",
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json()).then(r => {
      this.comicMsg["书名"] = r.cti
      let ourl = r.url
      let data = "?"
      if (r.auth_info)
        for (let key in r.auth_info) {
          data += `${key}=${r.auth_info[key]}&`
        }
      fetch(`${ourl}configuration_pack.json` + data, {
        method: 'GET',
        credentials: 'include' // 发送cookies
      }).then(r => r.json()).then(r => {
        this.imageData = r
        this.imageData.ourl = ourl
        this.imageData.data = data
        this.comicMsg["页数"] = this.imageData.configuration.contents.length
        this.sendMsg(1)
      })
    })

  }
  loadImage(i = 0) {

    if (i == this.imageData.configuration.contents.length) {
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
    let v = this.imageData.configuration.contents[i].file + "/0"
    let w = 0
    for (let f = 0; f < v.length; f++) {
      w += v.charCodeAt(f);
    }

    let a = {
      type: "start",
      url: this.imageData.ourl + v + ".jpeg" + this.imageData.data
    }
    window.req = new XMLHttpRequest,
      window.req.open("GET", a.url),
      window.req.withCredentials = !0,
      window.req.responseType = "blob",
      window.req.send(),
      new Promise(function (a, b) {
        window.req.onreadystatechange = function () {
          window.req && 4 === window.req.readyState && (200 === self.req.status ? a(self.req.response) : b(new Error("network error in worker")), self.req = null)
        }
      }).then(function (r) {
        return window.createImageBitmap(r)
      }).then(r => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        canvas.width = r.width
        canvas.height = r.height
        let n = makeList(r.width, r.height, 64, 64, w % 4 + 1)
        for (let p = 0; p < n.length; p++) {
          let o = n[p]
          ctx.drawImage(r, o.destX, o.destY, o.width, o.height, o.srcX, o.srcY, o.width, o.height);
        }
        let page = i
        if (this.zipFlag) {
          zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
        } else {
          chrome.runtime.sendMessage({
            downloadUrl: canvas.toDataURL(),
            filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
          });
        }
        this.sendMsg(2, {
          allPage: this.imageData.configuration.contents.length,
          nowPage: i
        })
        setTimeout(() => {
          this.loadImage(i + 1)
        }, 100)

      })

  }
}


var a = 61
  , b = 73
  , c = 4
  , d = 43
  , e = 47
  , f = 53
  , g = 59
  , h = 67
  , i = 71
  , j = 29
  , k = 37
  , l = 31
  , m = 41;
let makeList = function (a, b, f, g, h) {

  var i, n, o, p, q, r, s, t, u, v, w, x, y = Math.floor(a / f), z = Math.floor(b / g), A = a % f, B = b % g, C = [];
  if (i = y - 43 * h % y,
    i = i % y == 0 ? (y - c) % y : i,
    i = 0 == i ? y - 1 : i,
    n = z - e * h % z,
    n = n % z == 0 ? (z - c) % z : n,
    n = 0 == n ? z - 1 : n,
    A > 0 && B > 0 && (o = i * f,
      p = n * g,
      C.push({
        srcX: o,
        srcY: p,
        destX: o,
        destY: p,
        width: A,
        height: B
      })),
    B > 0)
    for (s = 0; s < y; s++)
      u = calcXCoordinateXRest_(s, y, h),
        v = calcYCoordinateXRest_(u, i, n, z, h),
        q = calcPositionWithRest_(u, i, A, f),
        r = v * g,
        o = calcPositionWithRest_(s, i, A, f),
        p = n * g,
        C.push({
          srcX: o,
          srcY: p,
          destX: q,
          destY: r,
          width: f,
          height: B
        });
  if (A > 0)
    for (t = 0; t < z; t++)
      v = calcYCoordinateYRest_(t, z, h),
        u = calcXCoordinateYRest_(v, i, n, y, h),
        q = u * f,
        r = calcPositionWithRest_(v, n, B, g),
        o = i * f,
        p = calcPositionWithRest_(t, n, B, g),
        C.push({
          srcX: o,
          srcY: p,
          destX: q,
          destY: r,
          width: A,
          height: g
        });
  for (s = 0; s < y; s++)
    for (t = 0; t < z; t++)
      u = (s + h * j + l * t) % y,
        v = (t + h * k + m * u) % z,
        w = u >= calcXCoordinateYRest_(v, i, n, y, h) ? A : 0,
        x = v >= calcYCoordinateXRest_(u, i, n, z, h) ? B : 0,
        q = u * f + w,
        r = v * g + x,
        o = s * f + (s >= i ? A : 0),
        p = t * g + (t >= n ? B : 0),
        C.push({
          srcX: o,
          srcY: p,
          destX: q,
          destY: r,
          width: f,
          height: g
        });
  return C
}

calcPositionWithRest_ = function (a, b, c, d) {
  return a * d + (a >= b ? c : 0)
}
calcXCoordinateXRest_ = function (b, c, d) {
  var e = (b + a * d) % c;
  return e
}
calcYCoordinateXRest_ = function (a, b, c, d, e) {
  var h, i, j, k, l = e % 2 === 1;
  return k = a < b ? l : !l,
    k ? (j = c,
      i = 0) : (j = d - c,
        i = c),
    h = (a + e * f + c * g) % j + i
}
calcXCoordinateYRest_ = function (a, b, c, d, e) {
  var f, g, j, k, l = e % 2 == 1;
  return k = a < c ? l : !l,
    k ? (j = d - b,
      g = b) : (j = b,
        g = 0),
    f = (a + e * h + b + i) % j + g
}
calcYCoordinateYRest_ = function (a, c, d) {
  var e = (a + b * d) % c;
  return e
}








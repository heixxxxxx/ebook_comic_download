let canvas = document.createElement("canvas")
let ctx = canvas.getContext("2d")
class BookliveComic {
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
    this.makeImg()
  }
  getInfo() {
    //获取cid
    let cid = window.location.href.split("cid=")[1]
    cid = cid.slice(0, cid.indexOf("&"))
    this.cid = cid
    let k = this.H(cid)
    let url = `https://booklive.jp/bib-api/bibGetCntntInfo?cid=${cid}&dmytime=${(new Date).getTime().toString()}&k=${k}`
    var r = new XMLHttpRequest;
    r.open("GET", url),
      r.responseType = "",
      r.send()
    r.onload = (t) => {
      let e = (JSON.parse(r.responseText).items[0])
      this.comicMsg["书名"] = e.Title
      let i = cid
      let n = k
      let l = this.toNumberArray(this.jt(i, n, e.stbl))
      let v = this.toNumberArray(this.jt(i, n, e.ttbl))
      let d = this.toStringArray(this.jt(i, n, e.ctbl))
      let b = this.toStringArray(this.jt(i, n, e.ptbl))
      this.X = {
        token: e.p,
        stbl: l,
        ttbl: v,
        ctbl: d,
        ptbl: b
      }
      url = `https://binb.booklive.jp/bib-deliv/sbcGetCntnt.php?cid=${cid}&p=${this.X.token}&vm=1&dmytime=${(new Date).getTime().toString()}`
      let r2 = new XMLHttpRequest;
      r2.open("GET", url),
        r2.responseType = "",
        r2.send()
      r2.onload = () => {
        let e = (JSON.parse(r2.responseText))

        const parser = new DOMParser();
        const doc = parser.parseFromString(e.ttx, "text/html");

        doc.getElementById("P0010")
        this.getPage(doc)

      }
    }
  }

  getPage(dom, page = 0) {
    let fileName = page + ""
    for (let i = (page + "").length; i < 4; i++) {
      fileName = "0" + fileName
    }
    if (dom.getElementById("P" + fileName)) {
      this.imageList.push(dom.getElementById("P" + fileName).getAttribute("src"))
      this.getPage(dom, page + 1)
    } else {
      this.comicMsg["页数"] = this.imageList.length
      this.sendMsg(1)
    }
  }

  toStringArray(t) {
    if (!Array.isArray(t))
      throw TypeError();
    if (t.some((t) => {
      return "string" != typeof t
    }))
      throw TypeError();
    return t
  }
  toNumberArray(t) {
    if (!Array.isArray(t))
      throw TypeError();
    if (t.some((t) => {
      return "number" != typeof t
    }))
      throw TypeError();
    return t
  }
  jt(t, i, n) {
    for (var r = t + ":" + i, e = 0, s = 0; s < r.length; s++)
      e += r.charCodeAt(s) << s % 16;
    0 == (e &= 2147483647) && (e = 305419896);
    var h = ""
      , u = e;
    for (s = 0; s < n.length; s++) {
      u = u >>> 1 ^ 1210056708 & -(1 & u);
      var o = (n.charCodeAt(s) - 32 + u) % 94 + 32;
      h += String.fromCharCode(o)
    }
    try {
      return JSON.parse(h)
    } catch (t) { }
    return null
  }
  H(t) {
    var n = this.getRandomString(16)
      , i = Array(Math.ceil(16 / t.length) + 1).join(t)
      , r = i.substr(0, 16)
      , e = i.substr(-16, 16)
      , s = 0
      , h = 0
      , u = 0;
    return n.split("").map((t, i) => {
      return s ^= n.charCodeAt(i),
        h ^= r.charCodeAt(i),
        u ^= e.charCodeAt(i),
        t + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"[s + h + u & 63]
    }).join("")
  }
  getRandomString(t, i) {
    for (var n = i || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_", r = n.length, e = "", s = 0; s < t; s++)
      e += n.charAt(Math.floor(Math.random() * r));
    return e
  }

  //下载
  makeImg(page = 0) {
    if (this.imageList.length <= page) {
      this.sendMsg(4)
      return 0
    }
    let t = this.imageList[page]
    let img = new Image()
    img.src = `https://binb.booklive.jp/bib-deliv/sbcGetImg.php?cid=${this.cid}&src=${encodeURIComponent(t)}&p=${this.X.token}&q=0&vm=1&dmytime=${(new Date).getTime().toString()}`
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      let coor = this.mt(t, img)
      // console.log(coor)
      // coor.forEach((t) => {
      //   var i = A(t.xdest, t.ydest, t.width, t.height)
      // })
      //切割三分的模式待优化
  
      coor.forEach((t) => {
        this.Qh(ctx, img, t.xsrc, t.ysrc, t.width, t.height, t.xdest, t.ydest, t.width, t.height)
      })

      chrome.runtime.sendMessage({
        downloadUrl: canvas.toDataURL(),
        filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
      });
      this.sendMsg(2, {
        allPage: this.imageList.length,
        nowPage: page
      })
      setTimeout(() => {
        this.makeImg(page + 1)
      }, 200)
    }

    img.setAttribute("crossOrigin", "anonymous");

  }
  Qh(t, i, n, r, e, s, h, u, o, a) {
    t.drawImage(i, n, r, e, s, h, u, o, a)
  }
  mt(t, img) {
    var i = [0, 0];
    if (t) {
      for (var n = t.lastIndexOf("/") + 1, r = t.length - n, e = 0; e < r; e++)
        i[e % 2] += t.charCodeAt(e + n);
      i[0] %= 8,
        i[1] %= 8
    }
    var s = this.X.ptbl[i[0]]
      , h = this.X.ctbl[i[1]];
    return this.fff(h, s, img)
  }
  fff(t, i, img) {
    let kt = null;
    let T;
    let j;
    let Dt;
    var n = t.match(/^=([0-9]+)-([0-9]+)([-+])([0-9]+)-([-_0-9A-Za-z]+)$/)
      , r = i.match(/^=([0-9]+)-([0-9]+)([-+])([0-9]+)-([-_0-9A-Za-z]+)$/);
    if (null !== n && null !== r && n[1] === r[1] && n[2] === r[2] && n[4] === r[4] && "+" === n[3] && "-" === r[3] && (T = parseInt(n[1], 10),
      j = parseInt(n[2], 10),
      Dt = parseInt(n[4], 10),
      !(8 < T || 8 < j || 64 < T * j))) {
      var e = T + j + T * j;
      if (n[5].length === e && r[5].length === e) {
        var s = this.Ct(n[5], T, j)
          , h = this.Ct(r[5], T, j)
        var Rt = n,
          Ft = t,
          Lt = h.n,
          Nt = h.t;
        kt = [];
        for (var u = 0; u < T * j; u++)
          kt.push(s.p[h.p[u]])
      }
    }

    for (var i = img.width - 2 * T * Dt, n = img.height - 2 * j * Dt, r = Math.floor((i + T - 1) / T), e = i - (T - 1) * r, s = Math.floor((n + j - 1) / j), h = n - (j - 1) * s, u = [], o = 0; o < T * j; ++o) {
      var a = o % T
        , f = Math.floor(o / T)
        , c = Dt + a * (r + 2 * Dt) + (Lt[f] < a ? e - r : 0)
        , l = Dt + f * (s + 2 * Dt) + (Nt[a] < f ? h - s : 0)
        , v = kt[o] % T
        , d = Math.floor(kt[o] / T)
        , b = v * r + (Rt[d] < v ? e - r : 0)
        , g = d * s + (Ft[v] < d ? h - s : 0)
        , p = Lt[f] === a ? e : r
        , m = Nt[a] === f ? h : s;
      0 < i && 0 < n && u.push({
        xsrc: c,
        ysrc: l,
        width: p,
        height: m,
        xdest: b,
        ydest: g
      })
    }
    return u
  }
  Ct(t, T, j) {
    let Jt = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1]
    var i, n = [], r = [], e = [];
    for (i = 0; i < T; i++)
      n.push(Jt[t.charCodeAt(i)]);
    for (i = 0; i < j; i++)
      r.push(Jt[t.charCodeAt(T + i)]);
    for (i = 0; i < T * j; i++)
      e.push(Jt[t.charCodeAt(T + j + i)]);
    return {
      t: n,
      n: r,
      p: e
    }
  }
}


function A(t, i, n, r) {
  if (void 0 === t && (t = 0),
    void 0 === i && (i = 0),
    void 0 === n && (n = 0),
    void 0 === r && (r = 0),
    "number" == typeof t)
    this.left = t,
      this.top = i,
      this.width = n,
      this.height = r;
  else if (t instanceof A) {
    var e = t;
    this.left = e.left,
      this.top = e.top,
      this.width = e.width,
      this.height = e.height
  } else {
    var s = t;
    this.left = s.left,
      this.top = s.top,
      this.width = s.width,
      this.height = s.height
  }
}
function intersect (t, i) {
  var n = t.left
    , r = t.left + t.width
    , e = t.top
    , s = t.top + t.height
    , h = i.left
    , u = i.left + i.width
    , o = i.top
    , a = i.top + i.height;
  if (n < u && h < r && e < a && o < s) {
      var f = Math.max(n, h)
        , c = Math.max(e, o);
      return B(f,c,Math.min(r, u) - f,Math.min(s, a) - c)
  }
  return null
}

function B(t, i, n, r) {
  if (void 0 === t && (t = 0),
  void 0 === i && (i = 0),
  void 0 === n && (n = 0),
  void 0 === r && (r = 0),
  "number" == typeof t)
      this.left = t,
      this.top = i,
      this.width = n,
      this.height = r;
  else if (t instanceof A) {
      var e = t;
      this.left = e.left,
      this.top = e.top,
      this.width = e.width,
      this.height = e.height
  } else {
      var s = t;
      this.left = s.left,
      this.top = s.top,
      this.width = s.width,
      this.height = s.height
  }
}
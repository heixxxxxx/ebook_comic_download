

let canvas = document.createElement("canvas")
class VoltageComic {
  constructor(webObj) {
    this.comicMsg = { "网站": webObj.name };
    this.imageList = [];
    this.X
    this.cid
    this.T = 8
    this.zipFlag = false
    this.getInfo()
  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }

  download() {
    this.downLoadImg()
  }
  downloadZip() {
    this.zipFlag = true
    this.downLoadImg()
  }

  getInfo() {

    this.cid = document.getElementById("content").getAttribute("data-ptbinb-cid")
    let keyK = this.codeN(this.cid)
    if (!document.getElementById("content")) return 0
    fetch(`${document.getElementById("content").getAttribute("data-ptbinb")}?cid=${this.cid}&dmytime=${(new Date).getTime().toString()}&k=${keyK}`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
        "sec-ch-ua-full-version": "\"123.0.6312.86\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"10.0.0\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },

      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json()).then(r => {
      this.X = this.getCode(r, this.cid, keyK)
      this.p = r.items[0].p
      // this.comicMsg['漫画名'] = r.items[0].SubTitle
      this.ContentsServer = r.items[0].ContentsServer
      fetch(`${this.ContentsServer}content`).then(r => r.json()).then(r => {
        const regex = /<t-img\s+src="([^"]+)" a="0"/g;
        let matches;
        while ((matches = regex.exec(r.ttx)) !== null) {
          this.imageList.push(matches[1]);
        }
        this.comicMsg["书名"]=r.ttx.slice(r.ttx.indexOf('<title>')+7,r.ttx.indexOf('</title>'))
        this.comicMsg['页数'] = this.imageList.length
        this.sendMsg(1)
      })
    })
  }
  downLoadImg(page = 0) {
    if (page == this.imageList.length) {
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
    image.src = `${this.ContentsServer}img/${this.imageList[page]}?p=${this.p}` +
      image.setAttribute("crossOrigin", "anonymous");
    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      this.draw(canvas, image, this.imageList[page])
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
        this.downLoadImg(page + 1)
      }, 50)
    }
  }

  openImg(src, i, n) {


    return {
      width: i,
      height: n,
      transfers: [{
        index: 0,
        coords: this.mt(src, {
          width: i,
          height: n
        })
      }]
    }
  }

  mt(t, g) {
    var i = [0, 0];
    if (t) {
      for (var n = t.lastIndexOf("/") + 1, r = t.length - n, e = 0; e < r; e++)
        i[e % 2] += t.charCodeAt(e + n);
      i[0] %= 8,
        i[1] %= 8
    }
    var s = this.X.ptbl[i[0]]
      , h = this.X.ctbl[i[1]];
    if ("=" === h.charAt(0) && "=" === s.charAt(0)) {
      return this.sf(h, s, g)
    } else if (h.match(/^[0-9]/) && s.match(/^[0-9]/)) {
      return this.ef(h, s, g)

    }

  }

  draw(r, e, src) {
    let t = this.openImg(src, e.width, e.height)
    var n = r.getContext("2d");
    t.transfers.forEach((i) => {
      i.coords.forEach((t) => {
        this.qh(n, e, t.xsrc, t.ysrc, t.width, t.height, t.xdest, t.ydest, t.width, t.height)
      })
    })
  }
  qh(t, i, n, r, e, s, h, u, o, a) {
    let f = 0
    t.drawImage(i, n, r, e + f, s + f, h, u, o, a)
  }
  getCode(t, i, n) {
    var e = t.items[0];
    var a = "p" in e ? e.p : null;
    if (!("stbl" in e && "ttbl" in e && "ctbl" in e && "ptbl" in e))
      return new Error("Missing scramble table.");
    var l = this.toNumberArray(this.jt(i, n, e.stbl))
      , v = this.toNumberArray(this.jt(i, n, e.ttbl))
      , d = this.toStringArray(this.jt(i, n, e.ctbl))
      , b = this.toStringArray(this.jt(i, n, e.ptbl))
    return {
      token: a,
      stbl: l,
      ttbl: v,
      ctbl: d,
      ptbl: b
    }
  }
  codeN(t) {
    var n = this.getRandomString(16)
      , i = Array(Math.ceil(16 / t.length) + 1).join(t)
      , r = i.substr(0, 16)
      , e = i.substr(-16, 16)
      , s = 0
      , h = 0
      , u = 0;
    return n.split("").map(function (t, i) {
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


    return JSON.parse(h)

  }
  toNumberArray(t) {

    if (!Array.isArray(t))
      throw TypeError();
    if (t.some(function (t) {
      return "number" != typeof t
    }))
      throw TypeError();
    return t
  }
  toStringArray(t) {
    if (!Array.isArray(t))
      throw TypeError();
    if (t.some(function (t) {
      return "string" != typeof t
    }))
      throw TypeError();
    return t
  }
  Ot(t) {
    for (var i = t.width - 2 * this.T * this.Dt, n = t.height - 2 * this.j * this.Dt, r = Math.floor((i + this.T - 1) / this.T), e = i - (this.T - 1) * r, s = Math.floor((n + this.j - 1) / this.j), h = n - (this.j - 1) * s, u = [], o = 0; o < this.T * this.j; ++o) {
      var a = o % this.T
        , f = Math.floor(o / this.T)
        , c = this.Dt + a * (r + 2 * this.Dt) + (this.Lt[f] < a ? e - r : 0)
        , l = this.Dt + f * (s + 2 * this.Dt) + (this.Nt[a] < f ? h - s : 0)
        , v = this.kt[o] % this.T
        , d = Math.floor(this.kt[o] / this.T)
        , b = v * r + (this.Rt[d] < v ? e - r : 0)
        , g = d * s + (this.Ft[v] < d ? h - s : 0)
        , p = this.Lt[f] === a ? e : r
        , m = this.Nt[a] === f ? h : s;
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
  sf(t, i, g) {
    this.kt = null;
    var n = t.match(/^=([0-9]+)-([0-9]+)([-+])([0-9]+)-([-_0-9A-Za-z]+)$/)
      , r = i.match(/^=([0-9]+)-([0-9]+)([-+])([0-9]+)-([-_0-9A-Za-z]+)$/);
    if (null !== n && null !== r && n[1] === r[1] && n[2] === r[2] && n[4] === r[4] && "+" === n[3] && "-" === r[3] && (this.T = parseInt(n[1], 10),
      this.j = parseInt(n[2], 10),
      this.Dt = parseInt(n[4], 10),
      !(8 < this.T || 8 < this.j || 64 < this.T * this.j))) {
      var e = this.T + this.j + this.T * this.j;
      if (n[5].length === e && r[5].length === e) {
        var s = this.Ct(n[5])
          , h = this.Ct(r[5]);
        this.Rt = s.n,
          this.Ft = s.t,
          this.Lt = h.n,
          this.Nt = h.t,
          this.kt = [];
        for (var u = 0; u < this.T * this.j; u++)
          this.kt.push(s.p[h.p[u]])
      }
    }
    return this.Ot(g)

  }
  ef(t, i, g) {
    this.Tt = null,
      this.Pt = null;
    var n = this.Ct(t)
      , r = this.Ct(i);
    n && r && n.ndx === r.ndx && n.ndy === r.ndy && (this.Tt = n,
      this.Pt = r)
    return this.Ot(g)
  }
  Ct(t) {
    let Jt = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1]
    var i, n = [], r = [], e = [];
    for (i = 0; i < this.T; i++)
      n.push(Jt[t.charCodeAt(i)]);
    for (i = 0; i < this.j; i++)
      r.push(Jt[t.charCodeAt(this.T + i)]);
    for (i = 0; i < this.T * this.j; i++)
      e.push(Jt[t.charCodeAt(this.T + this.j + i)]);
    return {
      t: n,
      n: r,
      p: e
    }
  }
}


//注入代码
injectedScriptToPage("/modules/shogakukanInjectedScript.js")

class ShogakukanComic {
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
    chrome.storage.local.set({ hei_data: { skey: this.skey, url: this.imageList } }, () => {
      window.open(this.imageList[0])
    });
    this.sendMsg(2, {
      allPage: this.imageList.length,

    })
  }
  downloadZip() {
    this.zipFlag = true
    chrome.storage.local.set({ hei_data: { skey: this.skey, url: this.imageList, zip: true } }, () => {
      window.open(this.imageList[0])
    });
    this.sendMsg(2, {
      allPage: this.imageList.length,

    })
  }
  getInfo() {
    if (document.getElementById("pageInfo_hei")) {
      let data = JSON.parse(document.getElementById("pageInfo_hei").innerText)
      this.imageList = data.page_list
      this.comicMsg["标题"] = document.getElementsByClassName("card__title__other-title")[0].innerText
      this.comicMsg["页数"] = data.page_list.length
      this.skey = data.scramble_seed
      this.sendMsg(1)
    } else {
      setTimeout(() => { this.getInfo() }, 500)
    }
  }
}


let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')


let skey
// 绘制源码
let Es = 2 ** 32 - 1
  , ks = 8, t = 4, $s = 1;
let page = 0

let zipFlag = false
chrome.storage.local.get('hei_data', function (result) {
  if (result.hei_data) {
    skey = result.hei_data.skey
    zipFlag = result.hei_data.zip
    download(result.hei_data.url)
    chrome.storage.local.remove('hei_data')
  }
});

function download(url) {
  if (page >= url.length) {
    if (zipFlag) {
      zip.generateAsync({ type: "blob" })
        .then((content) => {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = '下载' + ".zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.close()
        });
    } else {
      window.close()
    }

    return 0
  }
  let img = new Image()
  img.src = url[page]
  img.onload = function () {
    Ss(ctx, img, t, skey)
    page++
    download(url)
  }
}


let Ss = (e, i, t, s) => {
  canvas.width = i.width
  canvas.height = i.height
  e.drawImage(i, 0, 0);
  const o = Cs(i.width, i.height, t);

  if (!(!o || !Ps(s))) {
    e.clearRect(0, 0, o.width * t, o.height * t);
    for (const l of Is(t, s ?? 1))
      e.drawImage(i, l.source.x * o.width, l.source.y * o.height, o.width, o.height, l.dest.x * o.width, l.dest.y * o.height, o.width, o.height)

    if (zipFlag) {
      zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
    } else {
      chrome.runtime.sendMessage({
        downloadUrl: canvas.toDataURL(),
        filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
      });
    }
  }
}
let Cs = (e, i, t) => {
  if (e < t || i < t)
    return null;
  const s = xs(t, ks);
  return e > s && i > s && (e = Math.floor(e / s) * s,
    i = Math.floor(i / s) * s),
  {
    width: Math.floor(e / t),
    height: Math.floor(i / t)
  }
}
let xs = (e, i) => {
  e > i && ([e, i] = [i, e]);
  const t = (s, o) => s ? t(o % s, s) : o;
  return e * i / t(e, i)
}
let Ps = e => e === void 0 ? !1 : e === Math.max(Math.min(e, Es), $s)

let Is = function* (e, i) {
  yield* Ls([...Array(e ** 2)].map((s, o) => o), i).map((s, o) => ({
    source: {
      x: s % e,
      y: Math.floor(s / e)
    },
    dest: {
      x: o % e,
      y: Math.floor(o / e)
    }
  }))
}

let Ls = (e, i) => {
  const t = Ts(i);
  return e.map(o => [t.next().value, o]).sort((o, l) => +(o[0] > l[0]) - +(l[0] > o[0])).map(o => o[1])
}
let Ts = function* (e) {
  const i = Uint32Array.of(e);
  for (; ;)
    i[0] ^= i[0] << 13,
      i[0] ^= i[0] >>> 17,
      i[0] ^= i[0] << 5,
      yield i[0]
}

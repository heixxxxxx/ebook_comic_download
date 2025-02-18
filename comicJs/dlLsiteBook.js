injectedScriptToPage("/modules/dlsite.js")
class DlLsiteComic {
  constructor(webObj) {
    this.comicMsg = { "网站": webObj.name };
    this.scramble = {}
    this.imageList = []
    this.zipFlag = false
    this.imgBaseUrl = ""
    this.key = ""
    this.transferCanvas = document.createElement("canvas")
    this.getBookInfo()
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.getPage()
  }
  downloadZip() {
    this.zipFlag = true
    zip = new JSZip();
    this.getPage()
  }
  getBookInfo() {
    if (document.getElementById("pageInfo_hei")) {
      let data = JSON.parse(document.getElementById("pageInfo_hei").innerText)
      data.pages.forEach(item => {
        this.imageList.push(item.src)
      });
      this.comicMsg["标题"] = data.meta_data.title
      this.comicMsg["页数"] = data.page_count
      this.imgBaseUrl = data.imageUrl
      this.key = data.imgKey
      this.sendMsg(1)
    } else {
      setTimeout(() => { this.getBookInfo() }, 500)
    }
  }
  getPage(page = 0) {
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
    this.sendMsg(2, { nowPage: page })
    var data_xhr = new XMLHttpRequest();
    data_xhr.responseType = "arraybuffer";
    data_xhr.open("GET", this.imgBaseUrl.replace("pageDataPos", this.imageList[page]), true);
    //发送请求
    // data_xhr.withCredentials = true;
    data_xhr.send();
    data_xhr.onreadystatechange = (e) => {
      if (data_xhr.readyState === 4 && data_xhr.status === 200) {
        //转arraybuffer 格式
        Qpe(data_xhr.response, {
          key: this.key,
          method: "xor"
        }).then(r => {
          if (this.zipFlag) {
            zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", new Blob([r], {
              type: "image/jpeg"
            }));
          } else {
            chrome.runtime.sendMessage({
              downloadUrl: URL.createObjectURL(new Blob([r], {
                type: "image/jpeg"
              })),
              filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
            });
          }
          this.sendMsg(2, {
            allPage: this.imageList.length,
            nowPage: page
          })
          this.getPage(page + 1)
        }

        )


      }
    }
  }

}



const $pe = t => ({
  type: "StartDownloadingImage",
  payload: {
    key: t
  }
})
  , Bpe = (t, e) => ({
    type: "UpdateProgressOfDownloadingImage",
    payload: {
      key: t,
      progress: e
    }
  })
  , xM = (t, e) => ({
    type: "FinishedDownloadingImage",
    payload: {
      key: t,
      data: e
    }
  })
  , Upe = (t, e) => ({
    type: "FailedOnDownloadingImage",
    payload: {
      key: t,
      reason: e
    }
  })
  , Hpe = t => ({
    type: "EvictLoadedImage",
    payload: {
      key: t
    }
  })
  , Vpe = () => (t, e) => {
    switch (e.type) {
      case "StartDownloadingImage":
        return jpe(e.payload.key, t);
      case "UpdateProgressOfDownloadingImage":
        return Gpe(e.payload.key, e.payload.progress, t);
      case "FinishedDownloadingImage":
        return zpe(e.payload.key, e.payload.data, t);
      case "FailedOnDownloadingImage":
        return Kpe(e.payload.key, e.payload.reason, t);
      case "EvictLoadedImage":
        return Wpe(e.payload.key, t);
      default:
        return t
    }
  }
  , jpe = (t, e) => ({
    ...e,
    images: {
      ...e.images,
      [t]: {
        key: t,
        data: void 0,
        failed: !1,
        failedReason: null,
        progress: 0,
        isLoading: !0
      }
    }
  })
  , Gpe = (t, e, n) => {
    const r = n.images[t];
    return r ? {
      ...n,
      images: {
        ...n.images,
        [t]: {
          ...r,
          progress: e
        }
      }
    } : n
  }
  , zpe = (t, e, n) => {
    const r = n.images[t];
    return r ? {
      ...n,
      images: {
        ...n.images,
        [t]: {
          ...r,
          data: e,
          failed: !1,
          isLoading: !1
        }
      }
    } : n
  }
  , Kpe = (t, e, n) => {
    const r = n.images[t];
    return r ? {
      ...n,
      images: {
        ...n.images,
        [t]: {
          ...r,
          data: void 0,
          failed: !0,
          failedReason: e,
          isLoading: !1
        }
      }
    } : n
  }
  , Wpe = (t, e) => (e.images[t],
  {
    ...e,
    images: {
      ...e.images,
      [t]: void 0
    }
  })
  , qpe = () => {
    self.addEventListener("message", function (t) {
      const e = t.data
        , n = new Uint8Array(e.param.key.match(/.{1,2}/g).map(s => parseInt(s, 16)))
        , r = new Uint8Array(e.data)
        , i = n.length;
      for (let s = 0; s < r.length; s++)
        r[s] ^= n[s % i];
      postMessage({
        data: r,
        session: e.session
      })
    }, !1)
  }
  , Ype = t => {
    let e = t.toString();
    e = e.substring(e.indexOf("{") + 1, e.lastIndexOf("}"));
    const n = new Blob([e], {
      type: "application/javascript"
    });
    return new Worker(URL.createObjectURL(n))
  }
  ;
class Xpe {
  constructor() {
    this.worker = Ype(qpe),
      this.callbackTable = {},
      this.currentSession = 0,
      this.worker.addEventListener("message", e => {
        const n = e.data
          , r = this.callbackTable[n.session];
        r && (delete this.callbackTable[n.session],
          r(n.data))
      }
      )
  }
  Decode(e, n) {
    const r = this.currentSession++;
    return new Promise(i => {
      this.callbackTable[r] = i,
        this.worker.postMessage({
          data: e,
          param: n,
          session: r
        })
    }
    )
  }
  Terminate() {
    this.worker.terminate()
  }
}
let cw;
const Qpe = (t, e) => (cw == null && (cw = new Xpe),
  cw.Decode(t, e))
  , AM = t => {
    const e = t.match(/.{1,2}/g);
    return new Uint8Array(e.map(n => parseInt(n, 16)))
  }
  , Jpe = (t, e) => {
    const { cipherText: n, iv: r } = "include_iv" in e ? {
      cipherText: t.slice(16),
      iv: t.slice(0, 16)
    } : {
      cipherText: t,
      iv: AM(e.iv)
    };
    return crypto.subtle.importKey("raw", AM(e.key), "AES-CBC", !1, ["decrypt"]).then(i => crypto.subtle.decrypt({
      name: "AES-CBC",
      iv: r
    }, i, n))
  }




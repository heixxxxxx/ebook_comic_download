
class WalkerComic {
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
    this.toblob()
  }
  downloadZip() {
    this.zipFlag = true
zip = new JSZip();
    this.toblob()
  }
  getInfo() {
    let info = JSON.parse(document.getElementById("__NEXT_DATA__").innerText).props.pageProps.dehydratedState.queries[2].state.data.episode
    this.comicMsg["标题"] = info.title
    this.comicMsg["页数"] = info.internal.pageCount
    fetch(`https://comic-walker.com/api/contents/viewer?episodeId=${info.id}&imageSizeType=width%3A1284`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },

      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json()).then(r => {

      this.imageList.push(...r.manuscripts)
      this.sendMsg(1)
    })


  }
  toblob(page = 0) {
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
    let info = this.imageList[page]
    fetch(info.
      drmImageUrl
    ).
      then(async e => await e.arrayBuffer()).
      then(e => new Uint8Array(e)).
      then(this.xor(this.populateKey(info.drmHash))).
      then(e => {
        let blobUrl = URL.createObjectURL(new Blob([e]));

        if (this.zipFlag) {
          fetch(url[0]).then(res => res.blob()).then(blob => {
            zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", blob);
            this.sendMsg(2, {
              allPage: this.imageList.length,
              nowPage: page
            })
            setTimeout(() => {
              URL.revokeObjectURL(blobUrl)
              this.toblob(page + 1)
            }, 100)

          })
        } else {
          a_dom.href = blobUrl
          a_dom.download = page < 10 ? '0' + page + ".png" : page + ".png";
          a_dom.click()
          this.sendMsg(2, {
            allPage: this.imageList.length,
            nowPage: page
          })
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl)
            this.toblob(page + 1)
          }, 100)
        }




      });
  }
  populateKey(e) {
    let t = e.slice(0, 16).match(/[\da-f]{2}/gi);
    return new Uint8Array(t.map(e => parseInt(e, 16)))
  }

  xor(e) {
    return t => {
      let { length: r } = t
        , { length: n } = e
        , i = new Uint8Array(r);
      for (let a = 0; a < r; a += 1)
        i[a] = t[a] ^ e[a % n];
      return i
    }
  }
}
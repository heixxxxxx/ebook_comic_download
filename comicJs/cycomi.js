
class CycomiComic {
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
    this.downLoadImg()
  }
  //打包下载 
  downloadZip() {
    this.zipFlag = true
    this.downLoadImg()
  }
  getInfo() {
    let chapterId = location.href.split("?")[0].split("/")
    chapterId = chapterId[chapterId.length - 1]
    let data = document.getElementById("__NEXT_DATA__").innerText
    let titleId = data.slice(data.indexOf('"titleId":')).split(",")[0]
    titleId = titleId.slice(10)
    fetch("https://web.cycomi.com/api/chapter/page/list", {
      "headers": {
        "accept": "application/json",
        "accept-language": "zh,zh-CN;q=0.9",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-front-version": "7.120.04",
        "x-request-time": "1734939699187"
      },
      "referrer": "https://cycomi.com/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": `{\"titleId\":${titleId},\"chapterId\":${chapterId}}`,
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    }).then(r => r.json()).then(r => {
      r.data.pages.forEach(element => {
        this.imageList.push(element.image)
      });
      this.comicMsg['漫画名'] = document.getElementsByTagName("title")[0].innerHTML
      this.comicMsg[`页数`] = this.imageList.length
      this.sendMsg(1)
    })
  }
  downLoadImg(page = 1) {
    if (page >= this.imageList.length + 1) {
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
    let url = this.imageList[page - 1]

    fetch(url, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\""
      },
      "referrer": "https://cycomi.com/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    }).then(r => r.arrayBuffer()).then(r => {
      let t = url.match(/\/([0-9a-zA-Z]{32})\//)[1]
      let a = new FileReader;
      a.addEventListener("load", () => {
        r = a.result
        if (this.zipFlag) {
          zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", r.split(',')[1], { base64: true });
        } else {
          chrome.runtime.sendMessage({
            downloadUrl: 'data:image/png;base64,' + r.split(",")[1],
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

      })
      a.readAsDataURL(new Blob([n(new Uint8Array(r), t)]))
    })

    // var data_xhr = new XMLHttpRequest();
    // data_xhr.open("GET", url, true);
    // //发送请求
    // data_xhr.withCredentials = true;
    // data_xhr.responseType = "arraybuffer";
    // data_xhr.setRequestHeader("accept", "application/json, text/plain, */*");
    // data_xhr.send();
    // data_xhr.onload = (e) => {

    // }


  }
}
let n = (e, t) => {
  let r = (e => {
    let t = new Uint8Array(256);
    t.forEach((e, r) => {
      t[r] = r
    }
    );
    let r = 0;
    return t.forEach((n, i) => {
      r = (r + t[i] + e.charCodeAt(i % e.length)) % 256;
      let o = t[i];
      t[i] = t[r],
        t[r] = o
    }
    ),
      t
  }
  )(t)
    , n = 0
    , i = 0
    , o = new Uint8Array(e.length);
  for (let t = 0, a = e.length; t < a; t++) {
    let a = 256;
    i = (i + r[n = (n + 1) % 256]) % a;
    let s = r[n % 256];
    r[n % 256] = r[i],
      r[i] = s;
    let l = r[(r[n] + r[i]) % a];
    o[t] = l ^ e[t]
  }
  return o
}
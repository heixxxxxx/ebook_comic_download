class ZerosumComic {
  constructor(webObj) {
    this.comicMsg = { "网站": webObj.name };
    this.imageList = [];
    this.id = ""
    this.getInfo()
    this.zipFlag = false
    this.cleanCopyDom()
  }
  //发送消息
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //获取漫画信息
  getInfo() {
    let scriptDomList = document.getElementsByTagName("script")
    for (let i = 0; i < scriptDomList.length; i++) {
      if (scriptDomList[i].innerText.indexOf("decodedChapterId") != -1) {
        let text = scriptDomList[i].innerText.slice(scriptDomList[i].innerText.indexOf("decodedChapterId"))
        this.id = text.match(/\d+/g)[0]
        break;
      }
    }
    let metaDomList = document.getElementsByTagName("meta")
    for (let i = 0; i < metaDomList.length; i++) {
      if (metaDomList[i].name.indexOf("title") != -1) {
        this.comicMsg['漫画名'] = metaDomList[i].content.split("|")[0]
      }
    }
    this.comicMsg[`单集`] = document.getElementsByTagName("title")[0].innerText.split("|")[0]
    this.sendMsg(1)
  }
  //获取图片列表
  getImageList(page = 1) {
    fetch(`https://contents.zerosumonline.com/chapter_page/${this.id}/${page}.webp`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      "referrer": "https://zerosumonline.com/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    })
      .then(response => {
        if (response.ok) {
          return response.blob()
        }
      })
      .then(blob => {
        this.imageList[page - 1] = window.URL.createObjectURL(blob);
        if (this.zipFlag) {
          zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", blob);
        } else {
          a_dom.href = this.imageList[page - 1]
          a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
          a_dom.click()
        }
        this.comicMsg[`页数`] = this.imageList.length + "/?"
        this.sendMsg(2, { nowPage: page })
        this.getImageList(page + 1)
      }).catch(r => {
        this.comicMsg[`页数`] = this.imageList.length + "/" + this.imageList.length
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
      })
  }
  //下载
  download() {
    this.getImageList()
  }
  downloadZip() {
    this.zipFlag = true
zip = new JSZip();
    this.getImageList()
  }
  cleanCopyDom() {
    let sty = document.createElement('style');
    sty.innerText = '.cleanCopyDom:before{content:\' \';display:none;height:0;width:0;overflow:hidden;}';
    let imgs = document.getElementsByTagName("img")
    for (let i = 0; i < imgs.length; i++) {
      imgs[i].parentElement.className += " cleanCopyDom"
    }
    document.body.appendChild(sty);
  }

}

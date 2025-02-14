injectedScriptToPage("/modules/dlsite.js")
class DlLsiteComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.scramble = {}
    this.imageList = []
    this.zipFlag = false
    this.imgBaseUrl = ""
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
  getBookInfo() { (document.getElementById("pageInfo_hei")) {
      let data = JSON.parse(document.getElementById("pageInfo_hei").innerText)
      data.pages.forEach(item => {
        this.imageList.push(item.src)
      });
      this.comicMsg["标题"] = data.meta_data.title
      this.comicMsg["页数"] = data.page_count
      this.imgBaseUrl = data.imageUrl
      this.sendMsg(1)
    } else {
      setTimeout(() => { this.getInfo() }, 500)
    }
  }
  getPage(page = 0) {
    if (page == this.comicMsg["总页数"]) {
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
    data_xhr._responseType = "arraybuffer";
    data_xhr.open("GET", this.imgBaseUrl.replace("pageDataPos", this.imageList[page]), true);
    //发送请求
    // data_xhr.withCredentials = true;
    data_xhr.send();
    data_xhr.onreadystatechange = (e) => {
      if (data_xhr.readyState === 4 && data_xhr.status === 200) {
        var blob = new Blob([data_xhr.response]);
        console.log(URL.createObjectURL(blob))
        // getPage(page + 1)

      }
    }
  }

}
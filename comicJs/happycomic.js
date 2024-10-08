
let url
let param
let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
class HappycomicComic {
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
  getInfo() {
    let dom_list = document.getElementById("meta").children

    for (let i = 0; i < dom_list.length; i++) {
      if (dom_list[i].getAttribute("name") == 'cgi') {
        url = dom_list[i].value
      } else if (dom_list[i].getAttribute("name") == 'param') {
        param = dom_list[i].value
      }
    }
    fetch(`${url}?mode=999&reqtype=1&file=&param=${encodeURIComponent(param)}&vm=4&ts=${new Date().getTime()}`, {
      "headers": {
        "accept": "application/xml, text/xml, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      "referrer": "https://bs.comicdc.jp/e00662h5/bsr4b_hybrid/index.php?cgi=https%3A%2F%2Fbs.comicdc.jp%2Fe00662h5%2Fdiazepam_hybrid.php&url=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Findex.php%3Fid%3D00188-094A168713%26book%3D00188-094A168713-001&file=face.xml&param=NEYVDwNh6VPDDHnwMYXl2Ihji%2BcsmKUVBGSP6tMX2fyI1vXl7nHRV5U4S5pUz%2FacOeUPNptqwP0jecte1LE81MSQcIX8PU%2FSBJ60rvlD6VJNYFKVyIPXKsfN6rvGs2AkzKq%2BhUQllAK6Ut6vgEXkrYUt3ebGBZwV5kVztwzLwzK25tOkC9Rf1CZ%2BUFTszKlSv%2F9R2zw6z6kCS1iSNFLeR68Wqoy3LswfxMTOl%2BGaQWNw5T3r%2BeYWomVWJ%2BM7I9B%2BuJ6pf0dEwjAlMDcCL%2B%2BmRZFZO7M9xOzQjTUmI4Xy%2Fkk4OdJijMN28gL0LToMWlZB93fP0TUkebiIOlAn82EVgDhaOprQLG1aVNj3DtnwYFh4tHwLJMMfuidS8r6DEly7atwXFdOaMKNhsAxe1XwFxg%3D%3D&v_change=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Fv_change.php%3Fid%3D00188-094A168713-001%26return%3Dhttps%253A%252F%252Fhappycomic.jp%252Fweb%252Fbook%252Findex.php%253Fid%253D00188-094A168713%2526book%253D00188-094A168713-001%26vtype%3D4&colophon=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Fcolophon.php%3Fid%3D00188-094A168713-001%26carrier%3Di%26open_id%3DGUEST0000000000000024036037C5&colophon_size=640_950",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    }).then(r => r.text()).then(xmlText => {
      let parser = new DOMParser()
      let xml = parser.parseFromString(xmlText, "text/xml")
      param = encodeURIComponent(xml.getElementsByTagName('Content')[0].innerHTML)
      fetch(`${url}?mode=7&file=face.xml&reqtype=0&param=${param}&vm=4&ts=${new Date().getTime()}`, {
        "headers": {
          "accept": "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
          "accept-language": "zh-CN,zh;q=0.9",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": "https://bs.comicdc.jp/e00662h5/bsr4b_hybrid/index.php?cgi=https%3A%2F%2Fbs.comicdc.jp%2Fe00662h5%2Fdiazepam_hybrid.php&url=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Findex.php%3Fid%3D00015-094A190915%26book%3D00015-094A190915-001&file=face.xml&param=NEYVDwNh6VPDDHnwMYXl2Ihji%2BcsmKUVBGSP6tMX2fxXsPrw4UqKmah%2FhmioyT1EqFxA3o1adchDH3DKDeirHX2WwwL11%2BBJHYNzd2gp5yRNYFKVyIPXKsfN6rvGs2AkWDtTsUkVChVohSVlHW9PPgRY7cL9ZVmfdkDOV1Hp4lFZmziuVpBemBhfgQAQ8XuVAL2F2ETi0U9wgxem4DI6s6olu01za2jF57%2F%2BS%2BDHs5pw5T3r%2BeYWomVWJ%2BM7I9B%2BuJ6pf0dEwjAlMDcCL%2B%2BmRaTJcDulCp26xPJy8XMWg5WAvoI%2FdAtpAKYNxqgttcVV93fP0TUkebiIOlAn82EVgDhaOprQLG1aVNj3DtnwYFh4tHwLJMMfuidS8r6DEly7atwXFdOaMKNhsAxe1XwFxg%3D%3D&v_change=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Fv_change.php%3Fid%3D00015-094A190915-001%26return%3Dhttps%253A%252F%252Fhappycomic.jp%252Fweb%252Fbook%252Findex.php%253Fid%253D00015-094A190915%2526book%253D00015-094A190915-001%26vtype%3D4&colophon=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Fcolophon.php%3Fid%3D00015-094A190915-001%26carrier%3Di%26open_id%3DGUEST0000000000000024036037C5&colophon_size=640_950",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "omit"
      }).then(r => r.text()).then(xmlText => {
        let parser = new DOMParser()
        let xml = parser.parseFromString(xmlText, "text/xml")
        this.totalPage = xml.getElementsByTagName('TotalPage')[0].innerHTML
        this.w = xml.getElementsByTagName('Scramble')[0].children[0].innerHTML
        this.h = xml.getElementsByTagName('Scramble')[0].children[1].innerHTML

        let size = xml.getElementsByTagName('ContentFrame')[0].children[0].innerHTML + " x " + xml.getElementsByTagName('ContentFrame')[0].children[1].innerHTML
        this.comicMsg["页数"] = this.totalPage
        this.comicMsg["尺寸"] = size
        this.sendMsg(1)

      })

    })
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    this.downloadImage()
  }
  downloadZip() {
    this.zipFlag = true
    this.downloadImage()
  }
  downloadImage(page = 0) {
    if (page == this.totalPage) {
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
    let fileName = page + ''
    for (let i = 0; i < 4 - ((page + '').length); i++) {
      fileName = '0' + fileName
    }
    fetch(`${url}?reqtype=0&param=${param}&vm=4&ts=${new Date().getTime()}&file=${fileName}.xml&mode=8`, {
      "headers": {
        "accept": "application/xml, text/xml, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      "referrer": "https://bs.comicdc.jp/e00662h5/bsr4b_hybrid/index.php?cgi=https%3A%2F%2Fbs.comicdc.jp%2Fe00662h5%2Fdiazepam_hybrid.php&url=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Findex.php%3Fid%3D00263-094A146899%26book%3D00263-094A146899-001&file=face.xml&param=NEYVDwNh6VPDDHnwMYXl2Ihji%2BcsmKUVBGSP6tMX2fz%2BjzptYaMkU9hVKcNUHrgFmsZwqhCUpL4Q2m%2Bm9vIHQf4liAPS4%2BF6varsp0jr70BNYFKVyIPXKsfN6rvGs2AkzKq%2BhUQllAK6Ut6vgEXkre%2FkoUbNJ5hMF0sSMSQ7oyXaJOKo8Khk7ToA1WjMQuW%2F%2BLZ8VetzGzN3vnCYb8wHXTSyebJfR%2FjN7nIN%2FQBJj1Rw5T3r%2BeYWomVWJ%2BM7I9B%2BuJ6pf0dEwjAlMDcCL%2B%2BmRa7fdSecDASVIDqR5pctWtyR3ayjYnqUB1P%2BEvTdgV8Z93fP0TUkebiIOlAn82EVgDhaOprQLG1aVNj3DtnwYFh4tHwLJMMfuidS8r6DEly7atwXFdOaMKNhsAxe1XwFxg%3D%3D&v_change=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Fv_change.php%3Fid%3D00263-094A146899-001%26return%3Dhttps%253A%252F%252Fhappycomic.jp%252Fweb%252Fbook%252Findex.php%253Fid%253D00263-094A146899%2526book%253D00263-094A146899-001%26vtype%3D4&colophon=https%3A%2F%2Fhappycomic.jp%2Fweb%2Fbook%2Fcolophon.php%3Fid%3D00263-094A146899-001%26carrier%3Di%26open_id%3DGUEST0000000000000024036037C5&colophon_size=640_950",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "omit"
    }).then(r => r.text()).then(xmlText => {
      let parser = new DOMParser()
      let xml = parser.parseFromString(xmlText, "text/xml")
      let scramble = (xml.getElementsByTagName('Scramble')[0].innerHTML).split(",")

      let src = `${url}?reqtype=0&param=${param}&vm=4&ts=${new Date().getTime()}&file=${fileName}_0000.bin&mode=1`
      let image = new Image()
      image.src = src
      image.onload = () => {
        //绘制
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        let u = image
        let C = image
        let t = ctx
        let A = this.w * 1, g = this.h * 1, z = 8;
        let o = ((((C.naturalWidth / A) | 0) / z) | 0) * z;
        let v = ((((C.naturalHeight / g) | 0) / z) | 0) * z;
        let h = drawImage4Other;
        var s = (o * A);
        var B = (v * g);
        h(u, t, C.naturalWidth - s, B, s, 0, s, 0);
        h(u, t, C.naturalWidth, C.naturalHeight - B, 0, B, 0, B);
        for (let p = 0; p < g; ++p) {
          for (let q = 0; q < A; ++q) {
            var w = scramble[(p * A) + q];
            var m = ((w / A) | 0);
            var n = w - (m * A);
            var k = n * o;
            var j = m * v;
            var e = q * o;
            var d = p * v;
            h(u, t, o, v, k, j, e, d);
          }
        }
        //导出 
        if (this.zipFlag) {
          zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
        } else {
          chrome.runtime.sendMessage({
            downloadUrl: canvas.toDataURL(),
            filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
          });
        }
        this.sendMsg(2, {
          allPage: this.totalPage,
          nowPage: page
        })

        this.downloadImage(page + 1)
      }
    })

  }
}
let drawImage4Other = function (g, e, c, h, j, i, f, d) {
  if ((c <= 0) || (h <= 0)) {
    return;
  }
  e.drawImage(g, j, i, c, h, f, d, c, h);
}

// 官网更新，待重做
let jsText
let zipFlag = false
let jsDom = document.getElementsByTagName("script")
for (let i = 0; i < jsDom.length; i++) {
  if (jsDom[i].innerText.indexOf("GUARDIAN_SERVER") != -1) {
    jsText = jsDom[i].innerText
  }
}
let iframeDom
let GUARDIAN_SERVER
let page_data = []
let s3_key
let page_salt
let image_extension
var next
let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
let page = 0

//内嵌页
if (!jsText) {
  window.addEventListener('message', (event) => {

    if (event.data.key == 'download') {
      zipFlag = event.data.zipFlag
      //下载
      downloadImg()
    } else if (event.data.s3_key) {
      s3_key = event.data.s3_key
      GUARDIAN_SERVER = event.data.GUARDIAN_SERVER
      page_salt = event.data.page_salt
      image_extension = event.data.image_extension
      page_data = event.data.page_data

    }
  });

  //发送准备接受数据
  parent.postMessage({ keys: 'heixxx' }, '*');
}

class AnimateComic {
  constructor(webObj) {
    //this.comicMsg 是从网站中拿到的具体内容
    this.comicMsg = { "网站": webObj.name };
    //this.imageList 是图片列表
    this.imageList = []
    this.getInfo()
  }
  getInfo() {


    if (jsText) {
      let jsList = jsText.split(";")
      jsList.forEach(jsItem => {
        if (jsItem.indexOf("GUARDIAN_SERVER") != -1) {
          GUARDIAN_SERVER = jsItem.split("=")[1].replace(/"/g, "").replace(/;/g, "").replace(/'/g, "")
       
        } else if (
          jsItem.indexOf("book_data") != -1
        ) {
          let text = jsItem.slice(jsItem.indexOf("s3_key") + 9,)
          s3_key = text.slice(0, text.indexOf("\","))
          text = jsItem.slice(jsItem.indexOf("page_salt") + 12,)
          page_salt = text.slice(0, text.indexOf("\","))
          text = jsItem.slice(jsItem.indexOf("image_extension") + 18,)
          image_extension = text.slice(0, text.indexOf("\","))
        } else if (
          jsItem.indexOf("pages_data") != -1
        ) {
          let text = jsItem.slice(jsItem.indexOf("keys") + 8,)
          page_data = text.slice(0, text.indexOf("]")).split(",")
          page_data.forEach((item, i) => {
            page_data[i] = item.replace(/"/g, "").replace(/'/g, "")
          })

        }

      })


      //合成地址
      createImageFileName(page, page_salt, image_extension).then(r => {

       
        let url = GUARDIAN_SERVER + "/" + s3_key.replace(/\//g, "") + r
        iframeDom = document.createElement(
          "iframe"
        )
        iframeDom.style.display = "none"
        iframeDom.src = url
        document.body.appendChild(iframeDom)
        window.addEventListener('message', (event) => {

          if (event.data.page) {
            let page = event.data.page * 1
            if (page >= page_data.length) {
              this.sendMsg(4)
            } else {
              this.sendMsg(2, {
                allPage: page_data.length,
                nowPage: page
              })
            }

          } else if (event.data.keys == 'heixxx') {
            iframeDom.contentWindow.postMessage({ GUARDIAN_SERVER, page_data, s3_key, page_salt, image_extension }, '*');
            this.comicMsg["可下载页数"] = page_data.length
            this.sendMsg(1)

          }

        });

      })

    }
  }
  //向pop页面发送消息，修改弹窗内容
  //id: 0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
  sendMsg(id, msg = {}) {
    process = id
    chrome.runtime.sendMessage({ id, data: { comicMsg: this.comicMsg, ...msg } });
  }
  //下载 用户点击下载按钮时会触发的方法
  download() {
    downloadImg()
    iframeDom.contentWindow.postMessage({ key: 'download' }, '*');
  }
  downloadZip() {
    iframeDom.contentWindow.postMessage({ key: 'download', zipFlag: true }, '*');
  }
}

function draw(e, l) {
  var o = Math.floor(e.naturalWidth / 96) * Math.floor(e.naturalHeight / 128);
  //找一下参数规律
  str_to_int(page_data[page])

  for (var a = [], s = 0; s < o; ++s)
    a[s] = s;
  a = shuffle(a)

  for (var m = Math.floor(e.naturalWidth / 96), v = 0, w = a.length; v < w; ++v) {
    var y = +a[v]
      , b = 96 * Math.floor(v % m)
      , S = 128 * Math.floor(v / m)
      , x = Math.round(96 * Math.floor(y % m))
      , y = Math.round(128 * Math.floor(y / m));
    l.drawImage(e, b, S, 96, 128, x, y, 96, 128)
  }
}
function shuffle(e) {
  for (var t, n, i, o = [].concat(e), r = n = 0, a = o.length; 0 <= a ? n < a : a < n; r = 0 <= a ? ++n : --n)
    i = o[t = rand(o.length - 1)],
      o[t] = o[r],
      o[r] = i;
  return o
}
function rand(e) {
  return null != e ? (e = e + 1,
    Math.floor(next_int() / (Math.floor(32767 / e) + 1))) : next_int()
}
function next_int() {
  return next = (next * 1103515245 + 12345) % (32767 + 1),
    next
}
function str_to_int(e) {
  var t, n, i, o = 0;
  if (null != e)
    for (t = e.split(""); 0 < t.length;)
      i = t.shift(),
        n = t.shift(),
        o += i.charCodeAt(i = 0) << 8 | (i = n ? n.charCodeAt(0) : i);
  next = o
}
let createImageFileName = async function (e, t, n, i) {

  e += 1,
    i = i ? i + String(e) : e;
  return (t ? await o(t, i) : e) + "." + n
}
let o = async (e, n) => {
  const t = new TextEncoder;
  n = t.encode(n),
    e = t.encode(e),
    e = await crypto.subtle.importKey("raw", e, {
      name: "HMAC",
      hash: {
        name: "SHA-256"
      }
    }, !1, ["sign"]),
    e = await crypto.subtle.sign("HMAC", e, n);
  {
    n = e;
    let t = "";
    var i = new Uint8Array(n)
      , o = i.byteLength;
    for (let e = 0; e < o; e++)
      t += String.fromCharCode(i[e]);
    return btoa(t).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  }
}

function downloadImg() {
  if (!page_data[page]) {
    if (zipFlag) {
      zip.generateAsync({ type: "blob" })
        .then((content) => {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = '下载' + ".zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          parent.postMessage({ page: page + '' }, '*');
        });
    } else {
      parent.postMessage({ page: page + '' }, '*');
    }

    return 0
  }
  createImageFileName(page, page_salt, image_extension).then(r => {
    let url = GUARDIAN_SERVER + "/" + s3_key.replace(/\//g, "") + r
    let image = new Image()
    image.src = url

    image.onload = (e) => {
      //绘制
      canvas.width = image.width
      canvas.height = image.height

      draw(image, ctx)
      if (zipFlag) {
        zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
      } else {
        chrome.runtime.sendMessage({
          downloadUrl: canvas.toDataURL(),
          filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
        });
      }

      parent.postMessage({ page: page + '' }, '*');
      page++
      downloadImg()
    }
  })
}

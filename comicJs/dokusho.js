let cid
let keys
var next
let zipFlag = false
let canvas = document.createElement("canvas")
let ctx = canvas.getContext('2d')
//分析参数，同时兼容浏览页和浏览页内嵌的图片页iframe
if (window.location.search) {
  let searchList = window.location.search.slice(1).split("&")
  searchList.forEach(item => {
    if (item.split("=")[0] == 'cid') {
      cid = item.split("=")[1]
      console.log(cid)
    }
    if (item.split("=")[0] == 'zipFlag') {
      zipFlag = true
    }
    if (item.split("=")[0] == 'keys') {
      if (item.split("=")[1] == 'heixxx') {
        window.addEventListener('message', (event) => {
          if (event.data.keys) {
            keys = event.data.keys
            download()
          }
        });
        parent.postMessage({ keys: 'heixxx' }, '*');
      }
    }
  })
}
class DokushoComic {
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
    let iframeDom = document.createElement(
      "iframe"
    )
    iframeDom.style.display = "none"
    let url = this.info.guardianServer + "/" + this.info.bookData.s3_key
    let param = this.info.signedParams
    keys = this.info.keys
    iframeDom.src = url + '1.jpg?' + param + "&keys=heixxx"
    document.body.appendChild(iframeDom)

    window.addEventListener('message', (event) => {
      if (event.data.page) {
        let page = event.data.page * 1
        if (page >= keys.length) {
          this.sendMsg(4)
        } else {
          this.sendMsg(2, {
            allPage: keys.length,
            nowPage: page
          })
        }

      } else if (event.data.keys == 'heixxx') {
        iframeDom.contentWindow.postMessage({ keys: keys }, '*');
      }

    });
  }
  downloadZip() {
    let iframeDom = document.createElement(
      "iframe"
    )
    iframeDom.style.display = "none"
    let url = this.info.guardianServer + "/" + this.info.bookData.s3_key
    let param = this.info.signedParams
    keys = this.info.keys
    iframeDom.src = url + '1.jpg?' + param + "&keys=heixxx&zipFlag=true"
    document.body.appendChild(iframeDom)

    window.addEventListener('message', (event) => {
      if (event.data.page) {
        let page = event.data.page * 1
        if (page >= keys.length) {
          this.sendMsg(4)
        } else {
          this.sendMsg(2, {
            allPage: keys.length,
            nowPage: page
          })
        }

      } else if (event.data.keys == 'heixxx') {
        iframeDom.contentWindow.postMessage({ keys: keys }, '*');
      }

    });
  }
  getInfo(retry) {
    var data_xhr = new XMLHttpRequest();
    if (retry) {
      data_xhr.open("GET", `https://api.dokusho-ojikan.jp/dokusho-server/browser/custom_sample/v2/${cid}?put_log=true`, true);
    } else {
      data_xhr.open("GET", `https://api.dokusho-ojikan.jp/dokusho-server/browser/bookinfo/v3?bookId=${cid}&put_log=true`, true);
    }





    //发送请求
    data_xhr.withCredentials = true;
    data_xhr.send();
    data_xhr.onreadystatechange = (e) => {
      if (data_xhr.readyState === 4 && data_xhr.status === 200) {

        var response = data_xhr.responseText;
        let info = JSON.parse(response).result
        if (!info) {
          return this.getInfo(true)
        }
        this.comicMsg["书名"] = info.bookData.title;
        this.comicMsg["作者"] = info.bookData.author;
        this.comicMsg["页数"] = info.keys.length
        this.info = info
        this.sendMsg(1)

      }
    }
  }
}
function download(page = 0) {
 
  if (page >= keys.length) {
    if (zipFlag) {
      console.log(zip);

      zip.generateAsync({ type: "blob" })
        .then((content) => {
          console.log(content);
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
  let url = window.location.href.slice(0, window.location.href.indexOf("&keys="))
  url = url.split('1.jpg?')
  let image = new Image()
  image.src = url[0] + (page + 1) + '.jpg?' + url[1]
  image.onload = (e) => {
    descramble(image, canvas, keys[page])
    if (zipFlag) {
      zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
    } else {
      chrome.runtime.sendMessage({
        downloadUrl: canvas.toDataURL(),
        filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
      });
    }

    parent.postMessage({ page: page + '' }, '*');
    setTimeout(() => {
      download(page + 1)
    }, 200)
  }
}

function descramble(e, t, n) {

  var o = Math.floor(e.naturalWidth / 96) * Math.floor(e.naturalHeight / 128);
  next = _str_to_int(n)
  if ("string" == typeof n) {
    for (var s = [], a = 0; a < o; ++a)
      s[a] = a;

    s = shuffle(s)

  } else {
    if (!Array.isArray(n))
      return null;
    s = n
  }
  var l = t.getContext("2d");
  t.width = e.naturalWidth
  t.height = e.naturalHeight

  for (var m = Math.floor(e.naturalWidth / 96), v = 0, w = s.length; v < w; ++v) {
    var y = +s[v]
      , b = 96 * Math.floor(v % m)
      , S = 128 * Math.floor(v / m)
      , x = Math.round(96 * Math.floor(y % m));
    y = Math.round(128 * Math.floor(y / m)),
      l.drawImage(e, b, S, 96, 128, x, y, 96, 128)

  }
  return t

}

function shuffle(e,) {
  for (var t, n, i, o = [].concat(e), r = n = 0, s = o.length; 0 <= s ? n < s : s < n; r = 0 <= s ? ++n : --n)
    i = o[t = rand(o.length - 1)],
      o[t] = o[r],
      o[r] = i;

  return o
}

function rand(e,) {
  let RAND_MAX = 32767

  return null != e ? (e += 1,
    Math.floor(_next_int(_str_to_int()) / (Math.floor(RAND_MAX / e) + 1))) : _next_int(_str_to_int())
}

function _next_int() {
  let PARAM_A = 1103515245,
    PARAM_B = 12345,
    RAND_MAX = 32767

  return next = (next * PARAM_A + PARAM_B) % (RAND_MAX + 1),
    next
}

function _str_to_int(e) {
  var t, n, i, o = 0;
  if (null != e)
    for (t = e.split(""); 0 < t.length;)
      i = t.shift(),
        n = t.shift(),
        o += i.charCodeAt(i = 0) << 8 | (i = n ? n.charCodeAt(0) : i);
  return o
}
// 获取请求数据
let _XMLHttpRequest = XMLHttpRequest
let targetXml
let target2Xml
let p_dom = document.createElement("p")
p_dom.style.display = "none"
p_dom.id = "pageInfo_hei"
document.body.appendChild(p_dom);
let imageUrl = ""
XMLHttpRequest = function () {
  let myxml = new _XMLHttpRequest
  myxml._open = myxml.open
  myxml.open = function (m, src, a) {
    if (src.indexOf('viewer-meta.json') != -1) {
      targetXml = myxml
      getMsg()
    } else if (src.indexOf("decryption.key") != -1) {
      target2Xml = myxml
      getKey()
    } else if (imageUrl === '' && src.indexOf('Policy') != -1 && src.indexOf('Key-Pair-Id') != -1) {
      imageUrl = src
      let pagedata = imageUrl.split("?")[0].split("/")
      pagedata = pagedata[pagedata.length - 1]
      imageUrl = imageUrl.replace(pagedata, "pageDataPos")
    }
    myxml._open(m, src, a)
  }

  onload
  return myxml
}
function getMsg() {
  if ((targetXml.response || targetXml.responseText) && imageUrl) {
    let data = JSON.parse(targetXml.response || targetXml.responseText)
    data.imageUrl = imageUrl

    if (p_dom.innerHTML.length && JSON.parse(p_dom.innerHTML).imgKey) {
      data.imgKey = JSON.parse(p_dom.innerHTML).imgKey
    }
    p_dom.innerHTML = JSON.stringify(data)
  } else {
    setTimeout(getMsg, 1000)
  }
}
function getKey() {
  if ((target2Xml.response || target2Xml.responseText)) {
    let data = p_dom.innerHTML.length ? JSON.parse(p_dom.innerHTML) : { imgKey: target2Xml.responseText }
    data.imgKey = target2Xml.responseText
    p_dom.innerHTML = JSON.stringify(data)
  } else {
    setTimeout(getKey, 1000)
  }
}
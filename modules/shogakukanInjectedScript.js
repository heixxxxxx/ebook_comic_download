// 获取请求数据
let _XMLHttpRequest = XMLHttpRequest
let targetXml
let p_dom = document.createElement("p")
p_dom.style.display = "none"
p_dom.id = "pageInfo_hei"
document.body.appendChild(p_dom);

XMLHttpRequest = function () {
  let myxml = new _XMLHttpRequest
  myxml._open = myxml.open
  myxml.open = function (m, src, a) {

    if (src.indexOf('/episode/viewer') != -1) {
      targetXml = myxml
      getMsg()
    }
    myxml._open(m, src, a)
  }
  return myxml
}
function getMsg() {
  if (targetXml.responseText) {
    p_dom.innerHTML = targetXml.responseText
  } else {
    setTimeout(getMsg, 1000)
  }
}



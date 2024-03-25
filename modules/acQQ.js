function getNonce() {
  let nonce = ""
  let jsList = document.getElementsByTagName("script")
  for (let i = 0; i < jsList.length; i++) {
    if (!jsList[i].src) {
      let text = jsList[i].innerText.replace(/\"/g, "").replace(/\+/g, "").replace(/ /g, "")
      if (text.indexOf(`window[nonce]`) != -1 && text.split("=").length == 2) {
        nonce = eval(jsList[i].innerText.split("=")[1])
      }
    }
  }
  if (nonce) {
    let p_dom = document.createElement("p")
    p_dom.id = "nonceToContent"
    p_dom.innerText = nonce
    document.body.appendChild(p_dom)
  }
}
getNonce()
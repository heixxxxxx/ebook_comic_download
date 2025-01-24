let p_msg_dom = document.createElement("p")
p_msg_dom.id = "p_msg_dom"
let p_sign_dom = document.createElement("p")
p_sign_dom.id = "p_sign_dom"
document.body.appendChild(p_msg_dom)
document.body.appendChild(p_sign_dom)


const config = {
  childList: true, // 监听目标元素的子节点的增减
  subtree: true, // 监听目标元素及其所有后代的变动
  attributes: true, // 监听属性的变化
  characterData: true // 监听文本内容的变化
};
const observer = new MutationObserver((mutationsList) => {
  for (let mutation of mutationsList) {
    if (p_msg_dom.innerText) {
      p_sign_dom.innerText = JSON.stringify({
        ...genReqSign(...JSON.parse(p_msg_dom.innerText).data),
        type: JSON.parse(p_msg_dom.innerText).type
      })

    }
    break;
  }
});
observer.observe(p_msg_dom, config);
let a_dom = document.createElement("a")
document.body.appendChild(a_dom);
//解除网页右键禁止的 但是很受限制
document.addEventListener('contextmenu', function (e) {
  e.stopPropagation();
}, true);

//链接下载
function downloadByUrlList(urlList, page = 0, obj) {
  if (urlList.length == 0) {
    obj.sendMsg(4)
    return 0
  }
  a_dom.href = urlList[0]
  a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
  a_dom.click()
  if (obj) obj.sendMsg(2, { allPage: obj.imageList.length, nowPage: page })
  setTimeout(() => {
    urlList.splice(0, 1)
    downloadByUrlList(urlList, page + 1, obj)
  }, 200)
}
//请求下载
function downloadByFetch(urlList, page = 0, obj) {
  if (urlList.length == 0) {
    obj.sendMsg(4)
    return 0
  }
  obj.sendMsg(2, { allPage: obj.imageList.length, nowPage: page })
  fetch(urlList[0]).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
    a_dom.href = URL.createObjectURL(blob)
    a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
    a_dom.click()
    urlList.splice(0, 1)
    setTimeout(() => { downloadByFetch(urlList, page + 1, obj) }, 200)
  })

}
//监听dom内容改变
function listenDomChange(dom, fn) {
  const config = { attributes: true, childList: true };
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') { // DOM子节点发生改变时触发
        fn()
        break;
      }
    }
  });

  observer.observe(dom, config);
}
//全局解锁右键，比较消耗性能
function contextmenuOPen(dom = document) {
  dom.addEventListener('contextmenu', function (e) {
    e.stopPropagation();
    if (document.children.length) {
      for (let i = 0; i < document.children.length; i++) {
        contextmenuOPen(document.children[i])
      }
    }
  }, true);
}


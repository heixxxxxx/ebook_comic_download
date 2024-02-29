let a_dom = document.createElement("a")
document.body.appendChild(a_dom);

// 链接下载
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
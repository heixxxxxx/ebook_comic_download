let a_dom = document.createElement("a")
document.body.appendChild(a_dom);
//解除网页右键禁止的 但是很受限制
document.addEventListener('contextmenu', function (e) {
  e.stopPropagation();
}, true);

// 单张下载
function downloadByUrl(url, page) {
  a_dom.href = url
  a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
  a_dom.click()
}
//链接列表下载(blob,base64链接列表)
function downloadByUrlList(urlList, obj, page = 0) {
  urlList=[...urlList]
  if (urlList.length == 0) {
    obj.sendMsg(4)
    return 0
  }
  a_dom.href = urlList[0]
  a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
  a_dom.click()
  if (obj) obj.sendMsg(2, {
    allPage: obj.imageList.length,
    nowPage: page
  })
  setTimeout(() => {
    urlList.splice(0, 1)
    downloadByUrlList(urlList, obj, page + 1)
  }, 200)
}
//请求下载(使用http请求下载)
function downloadByFetch(urlList, obj, page = 0) {
  urlList=[...urlList]
  if (urlList.length == 0) {
    obj.sendMsg(4)
    return 0
  }
  obj.sendMsg(2, {
    allPage: obj.imageList.length,
    nowPage: page
  })
  fetch(urlList[0]).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
    a_dom.href = URL.createObjectURL(blob)
    a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
    a_dom.click()
    urlList.splice(0, 1)
    setTimeout(() => {
      downloadByFetch(urlList, obj, page + 1)
    }, 200)
  })

}
//转换的canvas下载（转换成canvas，文件大小会变大不少，更推荐http请求方式）
function downloadByCanvas(urlList, obj, page = 0) {
  urlList=[...urlList]
  if (urlList.length == 0) {
    obj.sendMsg(4)
    return 0
  }
  obj.sendMsg(2, {
    allPage: obj.imageList.length,
    nowPage: page
  })
  let image = new Image()
  console.error(urlList[0])
  image.src = urlList[0]
  // image.setAttribute("crossOrigin", "use-credentials");
  image.onload = (e) => {
    let canvas = document.createElement("canvas")
    let ctx = canvas.getContext('2d')
    //绘制
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)
    downloadByUrl(canvas.toDataURL("image/png"), page)
    urlList.splice(0, 1)
    downloadByCanvas(urlList, obj, page + 1)
  }
}
//调用背景脚本下载（如果图片资源涉及到跨域，就用这个）
function downloadByBgJs(urlList, obj, page = 0) {
  urlList=[...urlList]
  if (urlList.length == 0) {
    obj.sendMsg(4)
    return 0
  }

  chrome.runtime.sendMessage({
    downloadUrl: urlList[0],
    filename: page < 10 ? '0' + page + ".jpg" : page + ".jpg"
  });
  if (obj) obj.sendMsg(2, {
    allPage: obj.imageList.length,
    nowPage: page
  })
  setTimeout(() => {
    urlList.splice(0, 1)
    downloadByBgJs(urlList, obj, page + 1)
  }, 200)
}
//拼图3张 imageList 图 imgSize尺寸 position 位置。返回base64数据，用then接受
function puzzleToCanvas(imageSrcList, imgSize, position) {
  imageSrcList=[...imageSrcList]
  return new Promise(
    function (resolve, reject) {
      let imageList = []
      for (let i = 0; i < imageSrcList.length; i++) {
        let image = new Image()
        image.src = imageSrcList[i]
        image.setAttribute("crossOrigin", "anonymous");
        image.onload = () => {
          imageList.push(image)
          if (imageList.length == imageSrcList.length) {
            let canvas = document.createElement("canvas")
            let ctx = canvas.getContext('2d')
            //绘制
            canvas.width = imageList[0].naturalWidth
            canvas.height = imageList[0].naturalWidth * imgSize[1] / imgSize[0]
            let centerImgHeight = position[1] * canvas.height

            //三张图绘制位置 上 正中 下 
            ctx.drawImage(imageList[0], 0, 0)
            ctx.drawImage(imageList[1], 0, centerImgHeight)
            ctx.drawImage(imageList[2], 0, canvas.height - imageList[2].naturalHeight)
            //导出 
            resolve(canvas.toDataURL("image/png"));
          }

        }
      }

    }
  );
};

//监听dom内容改变 （需要监听的元素，回调）
function listenDomChange(dom, fn) {
  const config = {
    attributes: true,
    childList: true
  };
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

//递归全局解锁右键（如果打开插件，网站仍然没有解锁右键，可以试试这个）
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
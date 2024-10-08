// 说明：如果图片的请求地址有跨域限制：仿照网站配置相关请求获取图片
//跨域基础上需要canvas解码：获取图片时添加跨域配置 
//可以加载image对象，但是无法导出下载canvas（跨域污染绘制）:1.使用请求图片blob，转换成大blob地址绘制 2.图片资源禁止任何请求，可以使用页面内嵌iframe，在图片地址内进行绘制canvas再导出
var zip = new JSZip();
let a_dom = document.createElement("a")
document.body.appendChild(a_dom);
//解除网页右键禁止的 但是很受限制
document.addEventListener('contextmenu', function (e) {
  e.stopPropagation();
}, true);
//单张下载
function downloadByUrl(url, page) {
  a_dom.href = url
  a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";

  a_dom.click()
}
//链接列表下载(blob,base64链接列表)
function downloadByUrlList(urlList, obj, page = 0) {
  urlList = [...urlList]
  if (urlList.length == 0) {
    if (obj.zipFlag) {
      zip.generateAsync({ type: "blob" })
        .then((content) => {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = (obj.comicMsg['漫画名'] || obj.comicMsg['书名'] || '下载') + ".zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          obj.sendMsg(4)
        });
    } else {
      obj.sendMsg(4)
    }
    return 0
  }

  if (obj.zipFlag) {

    fetch(urlList[0]).then(res => res.blob()).then(blob => {
      zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", blob);
      if (obj) obj.sendMsg(2, {
        allPage: obj.imageList.length,
        nowPage: page
      })
      setTimeout(() => {
        urlList.splice(0, 1)
        downloadByUrlList(urlList, obj, page + 1)
      }, 200)
    })
  } else {
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

}
//请求下载(使用http请求下载)
function downloadByFetch(urlList, obj, page = 0) {
  urlList = [...urlList]
  if (urlList.length == 0) {
    if (obj.zipFlag) {
      zip.generateAsync({ type: "blob" })
        .then((content) => {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = (obj.comicMsg['漫画名'] || obj.comicMsg['书名'] || '下载') + ".zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          obj.sendMsg(4)
        });
    } else {
      obj.sendMsg(4)
    }
    return 0
  }
  obj.sendMsg(2, {
    allPage: obj.imageList.length,
    nowPage: page
  })
  fetch(urlList[0]).then(res => res.blob()).then(blob => { // 将链接地址字符内容转变成blob地址
    a_dom.href = URL.createObjectURL(blob)
    a_dom.download = page < 10 ? '0' + page + ".jpg" : page + ".jpg";
    if (obj.zipFlag) {
      zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", blob);
    } else {
      a_dom.click()
    }

    urlList.splice(0, 1)
    setTimeout(() => {
      downloadByFetch(urlList, obj, page + 1)
    }, 200)
  })
    .catch(
      () => {
        urlList.splice(0, 1)
        downloadByFetch(urlList, obj, page + 1)
      }
    )
}
//转换的canvas下载（转换成canvas，文件大小会变大不少，更推荐http请求方式）
function downloadByCanvas(urlList, obj, page = 0) {
  urlList = [...urlList]
  if (urlList.length == 0) {
    if (obj.zipFlag) {
      zip.generateAsync({ type: "blob" })
        .then((content) => {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = (obj.comicMsg['漫画名'] || obj.comicMsg['书名'] || '下载') + ".zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          obj.sendMsg(4)
        });
    } else {
      obj.sendMsg(4)
    }
    return 0
  }
  obj.sendMsg(2, {
    allPage: obj.imageList.length,
    nowPage: page
  })
  let image = new Image()
  image.src = urlList[0]
  image.setAttribute("crossOrigin", "use-credentials");

  image.onload = (e) => {
    let canvas = document.createElement("canvas")
    let ctx = canvas.getContext('2d')
    //绘制
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage(image, 0, 0)
    if (obj.zipFlag) {
      zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", canvas.toDataURL("image/png").split(',')[1], { base64: true });
    } else {
      downloadByUrl(canvas.toDataURL("image/png"), page)
    }

    urlList.splice(0, 1)
    downloadByCanvas(urlList, obj, page + 1)
  }
}
//调用背景脚本下载（如果图片资源涉及到跨域，就用这个）
function downloadByBgJs(urlList, obj, page = 0) {
  urlList = [...urlList]
  if (urlList.length == 0) {
    if (obj.zipFlag) {
      zip.generateAsync({ type: "blob" })
        .then((content) => {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = (obj.comicMsg['漫画名'] || obj.comicMsg['书名'] || '下载') + ".zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          obj.sendMsg(4)
        });
    } else {
      obj.sendMsg(4)
    }
    return 0
  }
  if (obj.zipFlag) {

    fetch(urlList[0]).then(res => res.blob()).then(blob => {
      zip.file(page < 10 ? '0' + page + ".jpg" : page + ".jpg", blob);
      if (obj) obj.sendMsg(2, {
        allPage: obj.imageList.length,
        nowPage: page
      })
      setTimeout(() => {
        urlList.splice(0, 1)
        downloadByBgJs(urlList, obj, page + 1)
      }, 200)
    })
  } else {
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

}

//监听dom内容改变 （需要监听的元素，回调）
function listenDomChange(dom, fn) {
  const config = {
    childList: true, // 监听目标元素的子节点的增减
    subtree: true, // 监听目标元素及其所有后代的变动
    attributes: true, // 监听属性的变化
    characterData: true // 监听文本内容的变化
  };
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      fn()
      break;
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
//动态注入脚本到页面环境 需要在清单中 web_accessible_resources配置对应网站和脚本路径
function injectedScriptToPage(jsPath,) {
  let injectedScript = document.createElement('script');
  injectedScript.src = chrome.runtime.getURL(jsPath);
  document.body.appendChild(injectedScript);
}
//动态注入脚本到内容脚本 需要在清单中 host_permissions配置对应网站
function injectedScriptToContent(jsPath) {
  chrome.runtime.sendMessage({
    jsPath
  });
}
//清除页面伪元素遮罩(如果用了 :before遮挡住图片，不一定能够成功覆盖样式)
function cleanCopyDom() {
  let sty = document.createElement('style');
  sty.innerText = '.cleanCopyDom:before{content:\' \';display:none;height:0;width:0;overflow:hidden;}';
  let imgs = document.getElementsByTagName("img")
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].parentElement.className += " cleanCopyDom"
  }
  let canvas = document.getElementsByTagName("canvas")
  for (let i = 0; i < canvas.length; i++) {
    canvas[i].parentElement.className += " cleanCopyDom"
  }
  document.body.appendChild(sty);

}

//定义一个变量记录进程
//0:未开始 1:加载中 2:下载中 3.下载暂停中 4.下载完成
let process = 0;
//下载器
let downloader = null;
// 监听来自Popup的消息
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    //请求信息 
    if (request.id == 0 && (process < 2 || process == 4)) {
      switch (request.webObj.key) {
        case 'bili': {
          downloader = new BiliComic(request.webObj);
          break;
        }
        case 'pixiv': {
          downloader = new PixivComic(request.webObj);
          break;
        }
      }
    }
    //请求下载
    else if (request.id == 1) {
      downloader.download()
    }

  }
);
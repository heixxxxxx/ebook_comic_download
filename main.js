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
        //自动化编码范围标识符
        //++//
        case 'bili': {
          downloader = new BiliComic(request.webObj);
          break;
        }
        case 'pixiv': {
          downloader = new PixivComic(request.webObj);
          break;
        }
        case 'qq': {
          downloader = new QqComic(request.webObj);
          break;
        }
        case 'cmoa': {
          downloader = new CmoaComic(request.webObj);
          break;
        }
        case 'corona': {
          downloader = new CoronaComic(request.webObj);
          break;
        }
        case 'zerosum': {
          downloader = new ZerosumComic(request.webObj);
          break;
        }
        case 'ganma': {
          downloader = new GanmaComic(request.webObj);
          break;
        }
        case 'pocket': {
          downloader = new PocketComic(request.webObj);
          break;
        }
        case 'hakusensha': {
          downloader = new HakusenshaComic(request.webObj);
          break;
        }
        case 'jump': {
          downloader = new JumpComic(request.webObj);
          break;
        }
        case 'bw': {
          downloader = new BwComic(request.webObj);
          break;
        }
        case 'bwTrial': {
          downloader = new BwTrialComic(request.webObj);
          break;
        }
        case 'dmmFree': {
          downloader = new DmmFreeComic(request.webObj);
          break;
        }
        case 'renta': {
          downloader = new RentaComic(request.webObj);
          break;
        }
        case 'fuz': {
          downloader = new FuzComic(request.webObj);
          break;
        }
        case 'valkyrie': {
          downloader = new ValkyrieComic(request.webObj);
          break;
        }
        case 'nico': {
          downloader = new NicoComic(request.webObj);
          break;
        }
        case 'kuaikan': {
          downloader = new KuaikanComic(request.webObj);
          break;
        }
        case 'honto': {
          downloader = new HontoComic(request.webObj);
          break;
        }
        case 'dlLsite': {
          downloader = new DlLsiteComic(request.webObj);
          break;
        }//++//
      }
    }
    //请求下载
    else if (request.id == 1) {
      downloader.download()
    } else if (process == 2) {
      downloader.sendMsg(2)
    }

  }
);
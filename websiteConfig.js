//定义一个地址参数列表,这个也是每做一个网站的，就添加一个新的对象

//key:识别的关键字
//jsFileName:js文件名，用于创建js文件和对象
//url:匹配的url，用于清单匹配（非常重要，具体写法请看清单的匹配规则）
//originUrl:根路径，用来看这个网站是否被我们支持，但具体能下载还要去阅读页（记得去掉末尾的斜杠）
//regex:匹配的正则（很重要，用这个来匹配地址栏的链接，要阅读页的正则表达式）

//以下字段用于ui展示的

//name:网站的名字
//supportMsg:支持但不在阅读页的提示
//loadingMsg:正在加载漫画信息的提示
//downloadMsg:加载数据完毕的其他提示
//loadStopMsg：下载中断的提示
var webList = [
  {
    key: 'bili',
    jsFileName: 'biliComic',
    url: 'https://manga.bilibili.com/mc*',
    originUrl: 'https://manga.bilibili.com',
    regex: /^https:\/\/manga\.bilibili\.com\/mc(\d+)\/(\d+).*/,
    name: "bilibili漫画",
    supportMsg: ["b漫下载需要保证用户<b>购买了</b>该话内容，如没有购买，只能下载第一页", "可以右键另存为页面图片（b的页面图片并非原图，推荐下载）"],
    loadingMsg: [],
    downloadMsg: ["b漫下载需要保证用户<b>购买了</b>该话内容，如没有购买，只能下载第一页", "可以右键另存为页面图片（b的页面图片并非原图，推荐下载）", "目前仅支持单独话下载，不支持整本下载"],
    loadStopMsg: "",
  },
  {
    key: 'pixiv',
    jsFileName: 'pixivComic',
    url: 'https://comic.pixiv.net/viewer/stories/*',
    originUrl: 'https://comic.pixiv.net',
    regex: /^https:\/\/comic\.pixiv\.net\/viewer\/stories\/.*/,
    name: "pixivコミック",
    supportMsg: ["pixiv被墙，可能下载速度偏慢"],
    loadingMsg: [],
    downloadMsg: ["pixiv被墙，可能下载速度偏慢", "如下载中途失败，请删除已经下载的图片再重新下载"],
    loadStopMsg: "",
  },
  {
    key: 'qq',
    jsFileName: 'acQQ',
    url: 'https://ac.qq.com/ComicView/index/id/*',
    originUrl: 'https://ac.qq.com',
    regex: /^https:\/\/ac\.qq\.com\/ComicView\/index\/id\/(\d+)\/cid\/(\d+).*/,
    name: "腾讯动漫",
    supportMsg: ["腾讯漫画可能解析失败，请尝试反复<b>刷新网页</b>"],
    loadingMsg: ["可能解析失败，请尝试反复<b>刷新网页</b>"],
    downloadMsg: ["可以右键另存为单张图片"],
    loadStopMsg: "",
  },
  {
    key: 'cmoa',
    jsFileName: 'cmoaComic',
    url: 'https://www.cmoa.jp/bib/*',
    originUrl: 'https://www.cmoa.jp',
    regex: /^https:\/\/www\.cmoa\.jp\/bib\.*/,
    name: "コミックシーモア",
    supportMsg: ["cmoa需要<b>手动翻阅</b>下载", "翻页时请缓慢翻页，保证每页图片加载"],
    loadingMsg: [],
    downloadMsg: ["点击下载后，请配合<b>手动翻页</b>", "翻页时请缓慢翻页，保证每页图片加载", "如翻阅完毕还有没下载的图片，请回翻"],
    loadStopMsg: "请翻页，程序会自动继续下载",
  },
  {
    key: 'corona',
    jsFileName: 'coronaComic',
    url: 'https://to-corona-ex.com/episodes/*',
    originUrl: 'https://to-corona-ex.com',
    regex: /^https:\/\/to-corona-ex\.com\/episodes\/\.*/,
    name: "コロナEX｜TOブックスの公式Web漫画サイト",
    supportMsg: [],
    loadingMsg: [],
    downloadMsg: ["可以右键下载单页，但图片非原图，不建议"],
    loadStopMsg: "",
  },
  {
    key: 'zerosum',
    jsFileName: 'zerosumComic',
    url: 'https://zerosumonline.com/episode/*',
    originUrl: 'https://zerosumonline.com',
    regex: /^https:\/\/zerosumonline\.com\/episode\/\.*/,
    name: "ゼロサムオンライン",
    supportMsg: ["zerosum被墙，可能下载速度偏慢", "可以右键保存单张图片"],
    loadingMsg: [],
    downloadMsg: ["zerosum被墙，可能下载速度偏慢", "如下载中途失败，请删除已经下载的图片再重新下载", "可以右键保存单张图片"],
    loadStopMsg: "",
  },

]
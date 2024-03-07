//定义一个地址参数列表,这个也是每做一个网站的，就添加一个新的对象
//key:识别的关键字
//url:匹配的url
//regex:匹配的正则（用这个来匹配地址栏的链接的）
//originUrl:根路径，用来看这个网站是否被我们支持，但具体能下载还要去阅读页
//name:网站的名字
//supportMsg:支持但不在阅读页的提示
//loadingMsg:正在加载漫画信息的提示
// downloadMsg:加载数据完毕的其他提示
//loadStopMsg：下载中断的提示
let webList = [
  {
    key: 'bili',
    name: "bilibili漫画",
    originUrl: 'https://manga.bilibili.com',
    url: 'https://manga.bilibili.com/detail/mc*/*',
    regex: /^https:\/\/manga\.bilibili\.com\/mc(\d+)\/(\d+).*/,
    supportMsg: ["b漫下载需要保证用户购买了该话内容，如没有购买，只能下载第一页", "可以右键另存为页面图片（b的页面图片并非原图，推荐下载）"],
    loadingMsg: [],
    downloadMsg: ["b漫下载需要保证用户购买了该话内容，如没有购买，只能下载第一页", "可以右键另存为页面图片（b的页面图片并非原图，推荐下载）", "目前仅支持单独话下载，不支持整本下载"],
    loadStopMsg: "",
  },
  {
    key: 'pixiv',
    name: "pixivコミック",
    originUrl: 'https://comic.pixiv.net',
    url: 'https://comic.pixiv.net/viewer/stories/*',
    regex: /^https:\/\/comic\.pixiv\.net\/viewer\/stories\/.*/,
    supportMsg: ["pixiv需要翻墙访问，可能下载速度偏慢"],
    loadingMsg: [],
    downloadMsg: ["pixiv需要翻墙访问，可能下载速度偏慢", "如下载中途失败，请删除已经下载的图片再重新下载"],
    loadStopMsg: "",
  },
  {
    key: 'qq',
    name: "腾讯动漫",
    originUrl: 'https://ac.qq.com',
    url: 'https://ac.qq.com/ComicView/index/id/655166/cid/26671',
    regex: /^https:\/\/ac\.qq\.com\/ComicView\/index\/id\/(\d+)\/cid\/(\d+).*/,
    supportMsg: ["腾讯漫画可能解析失败，请尝试反复刷新网页"],
    loadingMsg: ["可能解析失败，请尝试反复刷新网页"],
    downloadMsg: ["可以右键另存为单张图片"],
    loadStopMsg: "",
  },
  {
    key: 'cmoa',
    name: "コミックシーモア",
    originUrl: 'https://www.cmoa.jp',
    url: 'https://www.cmoa.jp/bib/*',
    regex: /^https:\/\/www\.cmoa\.jp\/bib\.*/,
    supportMsg: ["cmoa需要手动翻阅下载", "翻页时请缓慢翻页，保证每页图片加载"],
    loadingMsg: [],
    downloadMsg: ["点击下载后，请配合手动翻页", "翻页时请缓慢翻页，保证每页图片加载", "如翻阅完毕还有没下载的图片，请回翻"],
    loadStopMsg: "请翻页，程序会自动继续下载",
  }
]
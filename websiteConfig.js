//定义一个地址参数列表,这个也是每做一个网站的，就添加一个新的对象

//key:识别的关键字
//jsFileName:js文件名，用于创建js文件和对象（如果已经创建就不会动这个文件了，请放心跑自动编码）
//url:匹配的url，用于清单匹配（非常重要，具体写法请看清单的匹配规则）
//originUrl:根路径，用来看这个网站是否被我们支持，但具体能下载还要去阅读页（记得去掉末尾的斜杠）
//regex:匹配的正则（很重要，用这个来匹配地址栏的链接，要阅读页的正则表达式）

//以下字段用于ui展示的(修改这些不需要运行自动编码了，修改上面的内容，记得重新运行自动编码)

//name:网站的名字
//supportMsg:支持但不在阅读页的提示
//loadingMsg:正在加载漫画信息的提示
//downloadMsg:加载数据完毕的其他提示
//loadStopMsg：下载中断的提示


var webList = [{
  key: 'bili',
  jsFileName: 'biliComic',
  url: 'https://manga.bilibili.com/mc*',
  originUrl: 'manga.bilibili.com',
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
  originUrl: 'comic.pixiv.net',
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
  originUrl: 'ac.qq.com',
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
  originUrl: 'cmoa.jp',
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
  originUrl: 'to-corona-ex.com',
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
  originUrl: 'zerosumonline.com',
  regex: /^https:\/\/zerosumonline\.com\/episode\/\.*/,
  name: "ゼロサムオンライン",
  supportMsg: ["zerosum被墙，可能下载速度偏慢", "可以右键保存单张图片"],
  loadingMsg: [],
  downloadMsg: ["zerosum被墙，可能下载速度偏慢", "如下载中途失败，请删除已经下载的图片再重新下载", "可以右键保存单张图片"],
  loadStopMsg: "",
},
{
  key: 'ganma',
  jsFileName: 'ganmaComic',
  url: 'https://ganma.jp/*',
  originUrl: 'ganma.jp',
  regex: /^https:\/\/ganma\.jp\/.*/,
  name: "GANMA!(ガンマ)",
  supportMsg: ["可能当前页不是阅读页面，无法下载", "请点击到阅读漫画页下载"],
  loadingMsg: ["可能当前页不是阅读页面，无法下载", "请点击到阅读漫画页下载"],
  downloadMsg: [],
  loadStopMsg: "",
},
{
  key: 'pocket',
  jsFileName: 'pocketComic',
  url: 'https://pocket.shonenmagazine.com/episode/*',
  originUrl: 'shonenmagazine.com',
  regex: /^https:\/\/pocket\.shonenmagazine\.com\/episode\/.*/,
  name: "マガポケ",
  supportMsg: [],
  loadingMsg: ["支持右键保存单图"],
  downloadMsg: ["支持右键保存单图"],
  loadStopMsg: "",
},
{
  key: 'hakusensha',
  jsFileName: 'hakusenshaComic',
  url: 'https://bsreader.hakusensha-e.net/?param=*',
  originUrl: 'hakusensha-e.net',
  regex: /^https:\/\/bsreader\.hakusensha-e\.net\/\?param=.*/,
  name: "白泉社e-net!",
  supportMsg: [],
  loadingMsg: ["试阅只能下载十页左右，请购买后再试", "白泉社无法获取漫画信息，只能展示书籍内容目录", "杂志类页数较多，可能下载中途出错，请删除已下载的图片重新下载",],
  downloadMsg: ["试阅只能下载十页左右，请购买后再试", "白泉社无法获取漫画信息，只能展示书籍内容目录",],
  loadStopMsg: "",
},
{
  key: 'jump',
  jsFileName: 'jumpComic',
  url: 'https://shonenjumpplus.com/episode/*',
  originUrl: 'shonenjumpplus.com',
  regex: /^https:\/\/shonenjumpplus\.com\/episode.*/,
  name: "少年ジャンプ＋",

  supportMsg: [],
  loadingMsg: ["支持右键保存单张图片", "请右键偏中位置才能选中图片"],
  downloadMsg: ["支持右键保存单张图片", "请右键偏中位置才能选中图片，左边的图片右键右半部分，右边的在左半部分"],
  loadStopMsg: "",
},
{
  key: 'bw',
  jsFileName: 'bwBook',
  url: 'https://viewer.bookwalker.jp/*/*/viewer.html*',
  originUrl: 'bookwalker.jp',
  regex: /^https:\/\/viewer\.bookwalker\.jp\.*/,
  name: "BOOK WALKER",

  supportMsg: [],
  loadingMsg: ["支持右键保存单张图片", "请右键偏中位置才能选中图片"],
  downloadMsg: ["支持右键保存单张图片", "请右键偏中位置才能选中图片，左边的图片右键右半部分，右边的在左半部分"],
  loadStopMsg: "",
}


]
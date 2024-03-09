//监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //如果有下载链接，启动下载
    if (request.downloadUrl) {
        chrome.downloads.download({
            url: request.downloadUrl,
            filename: request.filename || 'download',
        });
    }
});
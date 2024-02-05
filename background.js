document.getElementById("button").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // 发送消息到当前激活的标签页的content script
    chrome.tabs.sendMessage(tabs[0].id, {});
  });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // 处理接收到的消息
  document.getElementById("msg").innerHTML = message.msg
});
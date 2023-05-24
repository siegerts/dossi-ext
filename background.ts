export {}

console.group("👋 Initializing Maintainer.")

chrome.tabs.query({ url: process.env.PLASMO_PUBLIC_MATCHES }, function (tabs) {
  for (let tab of tabs) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, updatedTab) => {
      if (tabId === tab.id && changeInfo.status === "complete") {
        try {
          chrome.tabs.sendMessage(tabId, {
            type: "URL_CHANGE"
          })
        } catch (error) {
          console.log(error)
        }
      }
    })
  }
})

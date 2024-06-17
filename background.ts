import { Storage } from "@plasmohq/storage"
import type { UrlMatch, Redirect } from "~types"

import Logger from "~lib/logger"

const extensionName = "dossi"

const storage = new Storage()
const logger = new Logger("dossi")

logger.info(`👋 Initializing ${extensionName}.`)

chrome.tabs.query({ url: process.env.PLASMO_PUBLIC_MATCHES }, function (tabs) {
  for (let tab of tabs) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, updatedTab) => {
      if (tabId === tab.id && changeInfo.status === "complete") {
        try {
          chrome.tabs.sendMessage(tabId, {
            type: "URL_CHANGE",
          })
        } catch (error) {
          logger.error(error)
        }
      }
    })
  }
})

const patterns = [
  {
    originAndPathMatches: `^https://github\.com/[a-zA-Z0-9\-_]+/[a-zA-Z0-9\-_]+/discussions/[0-9]+$`,
  },
  {
    originAndPathMatches: `^https://github\.com/[a-zA-Z0-9\-_]+/[a-zA-Z0-9\-_]+/issues/[0-9]+$`,
  },
  {
    originAndPathMatches: `^https://github\.com/[a-zA-Z0-9\-_]+/[a-zA-Z0-9\-_]+/pulls/[0-9]+$`,
  },
  {
    originAndPathMatches: `^https://github\.com/[a-zA-Z0-9\-_]+/[a-zA-Z0-9\-_]+$`,
  },
  { originAndPathMatches: `^https://github\.com/[a-zA-Z0-9\-_]+$` },
]

patterns.forEach((pattern, pos) => {
  chrome.webNavigation.onBeforeNavigate.addListener(
    async (details) => {
      await storage.set("from", { url: details.url, pos } as UrlMatch)
    },
    { url: [pattern] }
  )
  chrome.webNavigation.onCommitted.addListener(
    async (details) => {
      await storage.remove("redirect")

      if (details.transitionQualifiers.includes("server_redirect")) {
        logger.log("server_redirect detected.")

        let from: UrlMatch | null = await storage.get<UrlMatch>("from")

        if (!from) {
          return
        }

        const to = { url: details.url, pos } as UrlMatch

        if (from && to && from?.url !== to?.url && from?.pos == to?.pos) {
          await storage.set("redirect", {
            from: from?.url,
            to: to?.url,
          } as Redirect)

          // remove from storage
          await storage.remove("from")
        }
      }
    },
    { url: [pattern] }
  )
})

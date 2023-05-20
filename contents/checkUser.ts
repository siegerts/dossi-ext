export {}

import { Storage } from "@plasmohq/storage"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: [
    "https://github.com/*",
    "https://maintainer.cc/*"
    // "http://localhost:3000/*"
  ]
}

async function checkUser() {
  const storage = new Storage()

  const user = await storage.get("user")

  if (!user) {
    console.log("no user")
  } else {
    console.log("user present", user)
    await storage.clear()
  }

  const baseUrl =
    process.env.NODE_ENV == "production" ||
    process.env.NODE_ENV == "development"
      ? "https://maintainer.cc/api"
      : "http://locahost:3000/api"

  fetch(`${baseUrl}/auth/session`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(async (res) => {
      const json = await res.json()
      if (json.user) {
        const { user } = json

        console.log("saving user", user)
        await storage.set("user", user)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

const main = async () => {
  await checkUser()

  // Wait for all the watch event to be processed
  // await new Promise((resolve) => setTimeout(resolve, 1470))

  // await testBaseStorage()
}

main()

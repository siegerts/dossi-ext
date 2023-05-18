import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const resp = await fetch("https://maintainer.cc/api/summary", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  })

  const json = await resp.json()

  res.send({
    message: json.content
  })
}

export default handler

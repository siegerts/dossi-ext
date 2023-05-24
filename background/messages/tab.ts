import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  return res.send({
    url: req.sender.tab.url
  })
}

export default handler

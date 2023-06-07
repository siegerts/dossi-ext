import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  return res.send({
    url: req.sender.tab.url,
    title: req.sender.tab.title
  })
}

export default handler

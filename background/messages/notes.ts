import type { PlasmoMessaging } from "@plasmohq/messaging"

const baseUrl =
  process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development"
    ? "https://maintainer.cc/api"
    : "http://locahost:3000/api"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (req?.body?.type === "get") {
    const resp = await fetch(`${baseUrl}/notes`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })

    const ok = resp.ok

    if (resp.ok) {
      const notes = await resp.json()
      return await res.send({ notes, status: { ok } })
    } else {
      if (resp.status === 403) {
        return await res.send({ status: { ok, error: "user not logged in" } })
      } else {
        console.log("error ")
        return await res.send({ status: { ok, error: "notes not available" } })
      }
    }

    //
  } else if (req?.body?.type === "post") {
    console.log("URL sender", req.sender)
    const resp = await fetch(`${baseUrl}/notes`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: req.sender.url,
        content: req.body.content
      })
    })

    const note = await resp.json()

    res.send({
      note
    })
  } else if (req?.body?.type === "patch") {
    const resp = await fetch(`${baseUrl}/notes/${req?.body?.noteId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: req?.body?.note })
    })

    const json = await resp.json()

    res.send({
      note: json.content
    })
  } else if (req?.body?.type === "delete") {
    const resp = await fetch(`${baseUrl}/notes/${req?.body?.noteId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })

    const json = await resp.json()

    res.send({
      note: json.content
    })
  }
}

export default handler

import type { PlasmoMessaging } from "@plasmohq/messaging"

const fetchWithCredentials = (url: string, options: RequestInit) =>
  fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })

const handleResponse = async (
  resp: Response,
  res: PlasmoMessaging.Response,
  action: string
) => {
  const ok = resp.ok

  if (resp.ok) {
    try {
      const data = await resp.json()
      return res.send({ data, status: { ok } })
    } catch (error) {
      // no data returned
      return res.send({ status: { ok } })
    }
  } else {
    const error =
      resp.status === 403 ? "user not logged in" : `${action} action failed`
    return createErrorResponse(res, ok, error)
  }
}

const createErrorResponse = (
  res: PlasmoMessaging.Response,
  ok: boolean,
  error: string
) => {
  console.log(`Error: ${error}`)
  return res.send({ status: { ok, error } })
}

export { fetchWithCredentials, handleResponse, createErrorResponse }

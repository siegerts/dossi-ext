import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"

type Note = {
  id: string
  content: string
}

export const Notes = () => {
  // convert this to provider
  const [tabUrl, setTabUrl] = useState("")

  useEffect(() => {
    const init = async () => {
      const { url } = await sendToBackground({
        name: "tab" as never
      })
      setTabUrl(url)
    }

    init()
  }, [])

  const { status, error, data } = useQuery<boolean, Error, Array<Note>>(
    ["notes", tabUrl],
    async ({ queryKey }) => {
      try {
        let { notes, status } = await sendToBackground({
          name: "notes" as never,
          body: {
            type: "GET_NOTES_BY_URL",
            url: tabUrl
          }
        })

        if (status.ok) {
          console.log(notes)
          return notes
        } else {
          throw Error(status.error)
        }
      } catch (err) {
        throw Error(err)
      }
    }
  )

  return (
    <div>
      {status === "loading" && <p>Loading...</p>}
      {status === "error" && <p>Error: {error.message}</p>}
      {status === "success" && (
        <div>{data.length > 0 ? data.length : <p>No notes yet</p>}</div>
      )}
    </div>
  )
}

export default Notes

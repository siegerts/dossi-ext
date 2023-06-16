import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"
import { useEntity } from "@/contexts/entity"

type Note = {
  id: string
  content: string
}

export const Notes = () => {
  const entity = useEntity()

  const { status, error, data } = useQuery<boolean, Error, Array<Note>>(
    ["notes", entity?.url],
    async ({ queryKey }) => {
      try {
        let { notes, status } = await sendToBackground({
          name: "notes" as never,
          body: {
            type: "GET_NOTES_BY_URL",
            url: entity?.url
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

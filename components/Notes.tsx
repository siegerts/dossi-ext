import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

type Note = {
  id: string
  content: string
}

const Notes = () => {
  const { status, error, data } = useQuery<boolean, Error, Array<Note>>(
    ["notes", 1],
    async ({ queryKey }) => {
      try {
        let { notes, status } = await sendToBackground({
          name: "notes" as never,
          body: {
            type: "GET"
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
        <div>
          {}
          {data.length > 0 ? (
            data.length
          ) : (
            <div>
              <p>No notes yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Notes

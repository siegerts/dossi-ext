import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

type EntityItem = {
  id: string
  url: string
}

export const Entity = ({ tabUrl }: { tabUrl: string }) => {
  const { status, error, data } = useQuery<boolean, Error, Array<EntityItem>>(
    ["entity", tabUrl],
    async ({ queryKey }) => {
      try {
        let { data, status } = await sendToBackground({
          name: "entities" as never,
          body: {
            type: "GET_ENTITY_BY_URL",
            url: tabUrl
          }
        })

        if (status.ok) {
          console.log(data)
          return data
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
        <div>{data ? JSON.stringify(data) : <p>No entity yet</p>}</div>
      )}
    </div>
  )
}

export default Entity

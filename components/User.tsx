import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

interface TSession {
  email: string
  id: string
  image: string
  name: string
}

const Pins = () => {
  const { status, error, data } = useQuery<boolean, Error, TSession>(
    ["user"],
    async ({ queryKey }) => {
      try {
        let { user, status } = await sendToBackground({
          name: "user" as never
        })

        if (status.ok) {
          console.log(user)
          return user
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
      {status === "success" && <p>{data.name}</p>}
    </div>
  )
}

export default Pins

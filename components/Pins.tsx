import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"

type Pin = {
  id: string
  url: string
}

const Pins = () => {
  const { status, error, data } = useQuery<boolean, Error, Array<Pin>>(
    ["pins"],
    async ({ queryKey }) => {
      try {
        let { pins, status } = await sendToBackground({
          name: "pins" as never,
          body: {
            type: "GET"
          }
        })

        if (status.ok) {
          console.log(pins)
          return pins
        } else {
          throw Error(status.error)
        }
      } catch (err) {
        throw Error(err)
      }
    }
  )
}

export default Pins

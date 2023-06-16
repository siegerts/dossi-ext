import { sendToBackground } from "@plasmohq/messaging"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"

const PinButton = ({ pinId }: { pinId: string | null }) => {
  const client = useQueryClient()
  const pin = async () => {
    await sendToBackground({
      name: "pins",
      body: {
        type: "POST"
      }
    })

    client.invalidateQueries({ queryKey: ["pins"] })
  }

  const unpin = async (pinId: string) => {
    await sendToBackground({
      name: "pins",
      body: {
        type: "DELETE",
        pinId
      }
    })

    queryClient.invalidateQueries({ queryKey: ["pins"] })
  }

  return (
    <Button variant="ghost" onClick={() => (pinId ? unpin(pinId) : pin())}>
      {pinId ? "Unpin" : "Pin"}
    </Button>
  )
}

export default PinButton

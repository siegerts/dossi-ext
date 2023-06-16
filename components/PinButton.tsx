import { sendToBackground } from "@plasmohq/messaging"
import { useQueryClient } from "@tanstack/react-query"
import { useEntity } from "@/contexts/entity"

import { Button } from "@/components/ui/button"

const PinButton = ({ pinId }: { pinId: string | null }) => {
  const client = useQueryClient()
  const entity = useEntity()
  const pin = async () => {
    await sendToBackground({
      name: "pins",
      body: {
        type: "POST"
      }
    })

    client.invalidateQueries({ queryKey: ["entities", entity?.url] })
  }

  const unpin = async (pinId: string) => {
    await sendToBackground({
      name: "pins",
      body: {
        type: "DELETE",
        pinId
      }
    })

    client.invalidateQueries({ queryKey: ["entities", entity?.url] })
  }

  return (
    <Button variant="ghost" onClick={() => (pinId ? unpin(pinId) : pin())}>
      {pinId ? "Unpin" : "Pin"}
    </Button>
  )
}

export default PinButton

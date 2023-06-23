import { sendToBackground } from "@plasmohq/messaging"
import { useEntity } from "@/contexts/entity"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

const PinButton = ({ pinId }: { pinId: string | null }) => {
  const client = useQueryClient()
  const entity = useEntity()

  const pin = async () => {
    await sendToBackground({
      name: "pins",
      body: {
        type: "POST",
      },
    })

    client.invalidateQueries({ queryKey: ["entity", entity?.url] })
  }

  const unpin = async (pinId: string) => {
    await sendToBackground({
      name: "pins",
      body: {
        type: "DELETE",
        pinId,
      },
    })

    client.invalidateQueries({ queryKey: ["entity", entity?.url] })
  }

  return (
    <Button variant="ghost" onClick={() => (pinId ? unpin(pinId) : pin())}>
      <Icons.pin className="mr-2 h-4 w-4" />
      {pinId ? "Unpin" : "Pin"}
    </Button>
  )
}

export default PinButton

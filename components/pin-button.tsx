import { sendToBackground } from "@plasmohq/messaging"
import { useEntity } from "@/contexts/entity"
import { useQueryClient } from "@tanstack/react-query"
import { limitReached } from "@/lib/utils"
import { usePlanData } from "@/contexts/plan"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

const PinButton = ({ pinId }: { pinId: string | null }) => {
  const client = useQueryClient()
  const entity = useEntity()
  const { counts, limits } = usePlanData()

  const pin = async () => {
    if (limitReached(counts, limits, "pins")) return

    // if the entity doesn't exist,
    // we need to send the title
    await sendToBackground({
      name: "pins",
      body: {
        type: "POST",
        ...(!entity?.exists && { title: entity?.title }),
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
    <Button
      disabled={limitReached(counts, limits, "pins") && !pinId}
      size="sm"
      variant="ghost"
      onClick={() => (pinId ? unpin(pinId) : pin())}>
      <Icons.pin className="mr-2 h-4 w-4" />
      {pinId ? "Unpin" : "Pin"}
    </Button>
  )
}

export default PinButton

import { sendToBackground } from "@plasmohq/messaging"
import { useEntity } from "@/contexts/entity"
import { useQueryClient } from "@tanstack/react-query"
import { limitReached } from "@/lib/utils"
import { usePlanData } from "@/contexts/plan"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={limitReached(counts, limits, "pins") && !pinId}
            size="sm"
            variant="ghost"
            onClick={() => (pinId ? unpin(pinId) : pin())}>
            <Icons.pin className="h-4 w-4" />
            <span className="ml-1 text-xs">{pinId ? "Unpin" : "Pin"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-xs">{pinId ? "Unpin" : "Pin"}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PinButton

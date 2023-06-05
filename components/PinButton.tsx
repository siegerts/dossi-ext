import { sendToBackground } from "@plasmohq/messaging"
import { useQuery } from "@tanstack/react-query"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

const PinButton = ({
  queryClient,
  pinId
}: {
  queryClient: any
  pinId: string | null
}) => {
  const pin = async () => {
    await sendToBackground({
      name: "pins",
      body: {
        type: "POST"
      }
    })

    queryClient.invalidateQueries({ queryKey: ["pins"] })
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => (pinId ? unpin(pinId) : pin())}
            className="w-10 rounded-full p-0">
            <Plus className="h-4 w-4" />

            <span className="sr-only">Add</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PinButton

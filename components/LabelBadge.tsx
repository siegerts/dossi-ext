import { Badge, badgeVariants } from "@/components/ui/badge"
import { sendToBackground } from "@plasmohq/messaging"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

export const LabelBadge = ({ label, entityId, tabUrl, queryClient }) => {
  const deleteLabelFromEntity = async (labelId) => {
    await sendToBackground({
      name: "labelOnEntity",
      body: {
        type: "DELETE_LABEL_FROM_ENTITY",
        entityId,
        labelId
      }
    })

    queryClient.invalidateQueries({ queryKey: ["entity", tabUrl] })
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(badgeVariants({ variant: "secondary" }))}>
              {label?.label?.name}
              <Icons.close
                className="mr-1 h-3 w-3"
                onClick={() => deleteLabelFromEntity(label.label?.id)}
              />
            </span>
          </TooltipTrigger>

          {label?.label?.description && (
            <TooltipContent>
              <span>{label?.label?.description}</span>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </>
  )
}

export const LabelLogoBadge = () => {
  return (
    <Badge variant="secondary">
      <Icons.logo className="mr-1 h-3 w-3" />
      dossi
    </Badge>
  )
}

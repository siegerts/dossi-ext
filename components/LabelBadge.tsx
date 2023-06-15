import { Badge, badgeVariants } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

export const LabelBadge = ({ label }) => {
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(badgeVariants({ variant: "secondary" }))}>
              {label?.name}
            </span>
          </TooltipTrigger>

          {label?.description && (
            <TooltipContent>
              <span>{label?.description}</span>
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

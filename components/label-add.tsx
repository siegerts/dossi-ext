import { useEffect, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useEntity } from "@/contexts/entity"
import { useQueryClient } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Icons } from "@/components/icons"

const LabelAdd = ({ labels }) => {
  // create
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelDescription, setNewLabelDescription] = useState("")
  const [availableLabels, setAvailableLabels] = useState([])
  const [open, setOpen] = useState(false)
  const [showCreateLabelDialog, setShowCreateLabelDialog] = useState(false)
  const client = useQueryClient()
  const entity = useEntity()

  useEffect(() => {
    const labelsInclude = () => {
      return labels.filter((label) => {
        return !entity.labels.find(
          (entityLabel) => entityLabel.label.id === label.id
        )
      })
    }
    if (!entity.labels) {
      setAvailableLabels(labels)
      return
    }
    setAvailableLabels(labelsInclude())
  }, [labels, entity?.labels])

  const addLabeltoEntity = async (labelId) => {
    try {
      let { status } = await sendToBackground({
        name: "labelOnEntity",
        body: {
          type: "ADD_LABEL_TO_ENTITY",
          entityId: entity.id,
          labelId,
        },
      })
      if (status.ok) {
        client.invalidateQueries({ queryKey: ["entity", entity.url] })
      } else {
        throw Error(status.error)
      }
    } catch (err) {
      throw Error(err)
    }
  }

  const createLabel = async () => {
    try {
      let { status } = await sendToBackground({
        name: "labels",
        body: {
          type: "POST",
          name: newLabelName,
          description: newLabelDescription,
          color: "red-600",
        },
      })
      if (status.ok) {
        client.invalidateQueries({ queryKey: ["labels"] })
        setShowCreateLabelDialog(false)
      } else {
        throw Error(status.error)
      }
    } catch (err) {
      throw Error(err)
    }
  }

  const selectLabel = (value) => {
    const label = labels.find((label) => label.name === value)
    addLabeltoEntity(label.id)
    setOpen(false)
  }

  return (
    <Dialog
      open={showCreateLabelDialog}
      onOpenChange={setShowCreateLabelDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              badgeVariants({ variant: "outline" }),
              "rounded-md border-dashed"
            )}>
            <Icons.add className="mr-1 h-3 w-3" />
            Add label
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Add label..." autoFocus={true} />
            <CommandList>
              <CommandEmpty>No labels found.</CommandEmpty>
              <CommandGroup>
                {labels &&
                  Array.isArray(availableLabels) &&
                  availableLabels.length > 0 &&
                  availableLabels.map((label) => (
                    <CommandItem
                      key={label.id}
                      onSelect={(value) => {
                        selectLabel(value)
                      }}>
                      {label?.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowCreateLabelDialog(true)
                    }}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Label
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent className="rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create label</DialogTitle>
          <DialogDescription>
            Add a new label to classify pages.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Label name</Label>
              <Input
                id="name"
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="feature-request"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Label description</Label>
              <Input
                id="description"
                onChange={(e) => setNewLabelDescription(e.target.value)}
                placeholder="Give the people what they want!"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowCreateLabelDialog(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => createLabel()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LabelAdd

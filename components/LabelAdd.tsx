import { useState } from "react"
// import { useDebounce } from "@uidotdev/usehooks"
import { Icons } from "@/components/icons"
import { PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { badgeVariants } from "@/components/ui/badge"
import { sendToBackground } from "@plasmohq/messaging"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

type Label = {
  id: string
  value: string
}

const LabelAdd = ({ labels, entityId, tabUrl, queryClient }) => {
  // create
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelDescription, setNewLabelDescription] = useState("")
  const [open, setOpen] = useState(false)
  const [showCreateLabelDialog, setShowCreateLabelDialog] = useState(false)

  // add

  // filter

  // const [searchTerm, setSearchTerm] = useState("")
  // const [results, setResults] = useState([])
  // const [isSearching, setIsSearching] = useState(false)
  // const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // const handleChange = (e) => {
  //   setSearchTerm(e.target.value)
  // }

  const addLabeltoEntity = async (labelId) => {
    try {
      let { status } = await sendToBackground({
        name: "labelOnEntity",
        body: {
          type: "ADD_LABEL_TO_ENTITY",
          entityId,
          labelId
        }
      })
      if (status.ok) {
        console.log("invalidating...", tabUrl)
        queryClient.invalidateQueries({ queryKey: ["entity", tabUrl] })
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
          color: "red-600"
        }
      })
      if (status.ok) {
        queryClient.invalidateQueries({ queryKey: ["labels"] })
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
    <div className="flex items-center space-x-4">
      <Dialog
        open={showCreateLabelDialog}
        onOpenChange={setShowCreateLabelDialog}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "border-dashed",
                badgeVariants({ variant: "outline" })
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
                    Array.isArray(labels) &&
                    labels.length > 0 &&
                    labels.map((label) => (
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
        <DialogContent>
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
              {/* <div className="space-y-2">
                <Label htmlFor="plan">Subscription plan</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      <span className="font-medium">Free</span> -{" "}
                      <span className="text-muted-foreground">
                        Trial for two weeks
                      </span>
                    </SelectItem>
                    <SelectItem value="pro">
                      <span className="font-medium">Pro</span> -{" "}
                      <span className="text-muted-foreground">
                        $9/month per user
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select> */}
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
    </div>
  )
}

export default LabelAdd

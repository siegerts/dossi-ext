import { Remark } from "react-remark"
import { useState } from "react"
import { useEntity } from "@/contexts/entity"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { sendToBackground } from "@plasmohq/messaging"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { useQueryClient } from "@tanstack/react-query"

const Note = ({ note }) => {
  const [noteContent, setNoteContent] = useState(note.content)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isNoteSaving, setIsNoteSaving] = useState<boolean>(false)
  const client = useQueryClient()
  const entity = useEntity()

  const saveNote = async () => {
    await sendToBackground({
      name: "notes",
      body: {
        type: "PATCH",
        noteId: note.id,
        content: noteContent
      }
    })

    await client.invalidateQueries({ queryKey: ["entity", entity.url] })
    setIsEditing(false)
    setIsNoteSaving(false)
  }

  const deleteNote = async () => {
    await sendToBackground({
      name: "notes",
      body: {
        type: "DELETE",
        noteId: note.id
      }
    })

    await client.invalidateQueries({ queryKey: ["entity", entity.url] })
  }
  return (
    <>
      {!isEditing ? (
        <div className="my-2">
          <div className="flex items-center justify-between gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(note?.createdAt), {
                      addSuffix: true
                    })}
                  </span>
                </TooltipTrigger>

                <TooltipContent side="right">
                  <span className="text-xs">
                    {new Intl.DateTimeFormat(navigator.language, {
                      dateStyle: "long",
                      timeStyle: "short"
                    }).format(new Date(note?.createdAt))}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                  <Icons.ellipsis className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Icons.pen className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Edit
                </DropdownMenuItem>

                {/* <DropdownMenuItem>
                  <Star className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Favorite
                </DropdownMenuItem> */}

                <DropdownMenuItem onClick={() => deleteNote()}>
                  <Icons.trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Remark>{note.content}</Remark>
        </div>
      ) : (
        <>
          <div className="grid w-full items-center gap-1.5">
            <Textarea
              id="note"
              placeholder="Add your note here."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <div className="flex items-center justify-between gap-1.5">
              <Button
                variant="ghost"
                type="submit"
                onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsNoteSaving(true)
                  saveNote()
                }}
                disabled={isLoading || isNoteSaving}>
                {isNoteSaving ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Save</span>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Note

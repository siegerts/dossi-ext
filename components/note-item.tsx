import { useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { useEntity } from "@/contexts/entity"
import { useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { Remark } from "react-remark"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
// import rehypeHighlight from "rehype-highlight"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Icons } from "@/components/icons"

import { type INote } from "@/types/noteTypes"

const Note = ({ note }: { note: INote }) => {
  const [noteContent, setNoteContent] = useState(note.content)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isNoteSaving, setIsNoteSaving] = useState<boolean>(false)
  const client = useQueryClient()
  const entity = useEntity()

  const saveNote = async () => {
    if (!noteContent || noteContent === note.content) {
      setIsEditing(false)
      setIsNoteSaving(false)
      return
    }

    await sendToBackground({
      name: "notes",
      body: {
        type: "PATCH",
        noteId: note.id,
        content: noteContent.trim(),
      },
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
        noteId: note.id,
      },
    })

    await client.invalidateQueries({ queryKey: ["entity", entity.url] })
    await client.invalidateQueries({ queryKey: ["plan"] })
  }
  return (
    <>
      {!isEditing ? (
        <div className="my-2 w-full rounded-lg border border-slate-100 px-3 py-2 !shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(note?.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </TooltipTrigger>

                <TooltipContent side="right">
                  <span className="text-xs">
                    {new Intl.DateTimeFormat(navigator.language, {
                      dateStyle: "long",
                      timeStyle: "short",
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

                <DropdownMenuItem
                  onClick={() => deleteNote()}
                  className="text-red-600">
                  <Icons.trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70 text-red-600" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-x-auto">
            <Remark
              remarkPlugins={[remarkGfm, remarkBreaks]}
              // rehypePlugins={[rehypeHighlight]}
            >
              {note?.content}
            </Remark>
          </div>
        </div>
      ) : (
        <>
          <div className="grid w-full items-center gap-1.5">
            <Textarea
              id="note"
              placeholder="Add your note here..."
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

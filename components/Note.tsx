import { Remark } from "react-remark"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { sendToBackground } from "@plasmohq/messaging"

import { Textarea } from "@/components/ui/textarea"

import { formatDistanceToNow } from "date-fns"

const Note = ({ note, queryClient, tabUrl }) => {
  const [noteContent, setNoteContent] = useState(note.content)
  const [isEditing, setIsEditing] = useState(false)

  const saveNote = async () => {
    await sendToBackground({
      name: "notes",
      body: {
        type: "PATCH",
        noteId: note.id,
        content: noteContent
      }
    })

    await queryClient.invalidateQueries({ queryKey: ["entity", tabUrl] })
    setIsEditing(false)
  }
  return (
    <>
      {!isEditing ? (
        <>
          <Remark>{note.content}</Remark>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span>
                  {formatDistanceToNow(new Date(note?.createdAt), {
                    addSuffix: true
                  })}
                </span>
              </TooltipTrigger>
              {/* TODO: format this */}
              <TooltipContent>{note?.createdAt}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="submit" onClick={() => setIsEditing(true)}>
            edit
          </Button>
        </>
      ) : (
        <>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Textarea
              id="note"
              placeholder="Add your note here."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>
          <Button type="submit" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={saveNote}>
            Save note
          </Button>
        </>
      )}
    </>
  )
}

export default Note

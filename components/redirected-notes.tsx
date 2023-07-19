import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import { sendToBackground } from "@plasmohq/messaging"
import { useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

import { Remark } from "react-remark"
// import remarkBreaks from "remark-breaks"
// import remarkGfm from "remark-gfm"

const RedirectedNotes = ({ entity, redirectedEntity }) => {
  const [showTransferNotesDialog, setShowTransferNotesDialog] = useState(false)
  const [redirect, setRedirect] = useStorage("redirect")
  const client = useQueryClient()

  const handleTransferNotes = async () => {
    const { status } = await sendToBackground({
      name: "notes",
      body: {
        type: "TRANSFER",
        ...(!entity?.exists && { title: entity?.title }),
        from: redirectedEntity?.id,
        to: entity?.id,
      },
    })

    if (status.ok) {
      client.invalidateQueries({ queryKey: ["entity", entity?.url] })
      setRedirect({ to: null, from: null })
      setShowTransferNotesDialog(false)
    }
  }

  return (
    <div className="my-2 flex flex-col gap-y-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Icons.alertTriangle className="h-5 w-5 text-red-500" />
        <h3 className="text-sm font-semibold">Redirected</h3>
      </div>
      <p>
        This page may have been redirected from {redirectedEntity?.url}.{" "}
        {redirectedEntity?.notes?.length > 0 && (
          <span>
            You have {redirectedEntity?.notes?.length} note
            {redirectedEntity?.notes?.length == 1 ? "" : "s"} for that page.
          </span>
        )}
      </p>
      <Dialog
        open={showTransferNotesDialog}
        onOpenChange={setShowTransferNotesDialog}>
        <DialogTrigger asChild>
          <Button>Review and transfer notes</Button>
        </DialogTrigger>
        <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Notes for{" "}
              {redirectedEntity?.url.replace("https://github.com/", "")}
            </DialogTitle>
            <DialogDescription>
              These are your previous notes. Review and transfer them to this
              new page at the bottom.{" "}
            </DialogDescription>
          </DialogHeader>

          {redirectedEntity?.notes.map((note: any) => (
            <div
              key={note?.id}
              className="my-2 w-full rounded-lg border border-slate-100 px-3 py-2 !shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-gray-500">
                  {new Intl.DateTimeFormat(navigator.language, {
                    dateStyle: "long",
                    timeStyle: "short",
                  }).format(new Date(note?.createdAt))}
                </span>
              </div>

              <div className="overflow-x-auto">
                {/* @ts-ignore */}
                <Remark
                //  remarkPlugins={[remarkGfm, remarkBreaks]}
                >
                  {note?.content}
                </Remark>
              </div>
            </div>
          ))}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransferNotesDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => handleTransferNotes()}>
              Transfer notes to {entity?.url.replace("https://github.com/", "")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RedirectedNotes

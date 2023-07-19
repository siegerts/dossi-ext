import { useState, useEffect } from "react"
import Note from "@/components/note-item"
import { useEntity } from "@/contexts/entity"
import { useUserLabels } from "@/contexts/labels"
import LabelAdd from "~components/label-add"
import LabelList from "~components/label-list"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { type INote, type INotesArray } from "@/types/noteTypes"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const NoteList = () => {
  const entity = useEntity()
  const { labels } = useUserLabels()

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [notes, setNotes] = useState<INotesArray>(entity?.notes ?? [])
  const [selectedSort, setSelectedSort] = useState({
    label: "Oldest",
    value: "asc",
  })

  const [sortOptions, setSortOptions] = useState([
    {
      label: "Newest",
      value: "desc",
    },
    {
      label: "Oldest",
      value: "asc",
    },
  ])

  useEffect(() => {
    if (entity?.notes) {
      if (sortDirection === "asc") {
        setNotes(sortNotesByDate(entity?.notes))
      } else if (sortDirection === "desc") {
        setNotes(entity?.notes.reverse())
      }
    }
  }, [entity?.notes])

  const sortNotesByDate = (notes: INotesArray): INotesArray => {
    return [...notes].sort(
      (a: INote, b: INote) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }

  const handleSortNotes = (direction: string) => {
    if (direction === "asc" && sortDirection !== "asc") {
      setNotes(sortNotesByDate(notes))
      setSortDirection("asc")
    } else if (direction === "desc" && sortDirection !== "desc") {
      setNotes(notes.reverse())
      setSortDirection("desc")
    }
    return
  }

  return (
    <div className="mb-5 grid gap-2">
      {entity?.status === "loading" && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-[65px] rounded-full px-2.5" />
            <Skeleton className="h-5 w-[63px] rounded-full px-2.5" />
            <Skeleton className="h-5 w-[68px] rounded-full px-2.5" />
          </div>
          <div className="my-5 flex items-center gap-3 space-x-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[350px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[335px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[350px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[335px]" />
            </div>
          </div>
        </>
      )}

      {entity?.status === "success" && entity?.exists && (
        <>
          <div className="flex flex-wrap items-center gap-2 py-4">
            <LabelList labels={entity?.labels} />
            <LabelAdd labels={labels} />
          </div>

          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="notes">Notes</Label>
            <Select
              value={selectedSort.value}
              onValueChange={(value) => {
                selectedSort.value !== value &&
                  setSelectedSort(
                    sortOptions.find((opt) => opt.value === value) || null
                  )
                handleSortNotes(value)
              }}>
              <SelectTrigger className="h-7 w-[145px] text-xs [&_svg]:h-4 [&_svg]:w-4">
                <span className="text-muted-foreground">Sort by: </span>
                <SelectValue placeholder="Sort by:" />
              </SelectTrigger>

              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {entity?.exists && notes ? (
            <>
              <div id="notes">
                {notes.map((note: INote) => (
                  <Note key={note?.id} note={note} />
                ))}
              </div>
            </>
          ) : (
            <div id="notes" className="m-4">
              <p>No notes yet...</p>
            </div>
          )}
        </>
      )}

      {entity?.status === "error" && (
        <Alert className="mt-5">
          <AlertTitle>Oh no!</AlertTitle>
          <AlertDescription>
            There's an issue loading these notes. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default NoteList

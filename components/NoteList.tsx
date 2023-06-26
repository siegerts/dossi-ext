import { useState, useEffect } from "react"
import Note from "@/components/Note"
import { useEntity } from "@/contexts/entity"
import { useUserLabels } from "@/contexts/labels"
import LabelAdd from "@/components/LabelAdd"
import LabelList from "@/components/LabelList"
import { Skeleton } from "@/components/ui/skeleton"
import { type INote, type INotesArray } from "@/types/noteTypes"

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

      {entity?.status === "error" && <p>Error loading</p>}

      {entity?.status === "success" && entity?.exists && (
        <>
          <div className="flex flex-wrap items-center gap-2 py-4">
            <LabelList labels={entity?.labels} />
            <LabelAdd labels={labels} />
          </div>

          <div className="mb-2 flex justify-end">
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
            <div>
              {notes.map((note: INote) => (
                <Note key={note?.id} note={note} />
              ))}
            </div>
          ) : (
            <p>No notes yet...</p>
          )}
        </>
      )}
    </div>
  )
}

export default NoteList

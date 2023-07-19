import * as z from "zod"

import { entityUrlSchema } from "./entity"

export const noteCreateSchema = z.object({
  content: z.string().trim(),
  title: z.string().trim().optional(),
  url: entityUrlSchema,
})

export const notePatchSchema = z.object({
  content: z.string(),
})

// there may not be a current entity id
// so it's optional and will be generated
export const notesTransferSchema = z.object({
  title: z.string().trim().optional(),
  url: entityUrlSchema,
  from: z.string().trim(),
  to: z.string().trim().optional(),
})

import { useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

const FormSchema = z.object({
  dob: z.date({
    required_error: "A date is required.",
  }),
})

export function DatePickerReminderForm({
  queryClient,
  tabUrl,
}: {
  queryClient: any
  tabUrl: string
}) {
  const [reminder, setReminder] = useState("")

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // await sendToBackground({
    //   name: "reminders",
    //   body: {
    //     type: "POST",
    //     reminder
    //   }
    // })
    // setReminder("")
    // queryClient.invalidateQueries({ queryKey: ["reminders"] })

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-2">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Reminder date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start px-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Choose date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date > new Date("2024-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}

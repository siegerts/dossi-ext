import { useState } from "react"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"

type SerializedNote = {
  title: string;
  content: string;
};


export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*/*/issues/*"]
}


export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  document.querySelector("#partial-new-comment-form-actions")



const PlasmoInline = () => {
  const [notes, setNotes] = useState(null)

  const getNotes = async () => {
   
    console.log("getting triage message")
    const resp = await sendToBackground({
      name: "notes",
      body: {
        type: "get"
      }
    
    })
    console.log("received triage message")
    console.log(resp);
    setNotes(resp.notes);

    // replacee #new_comment_field value with resp.message
   (document.querySelector("#new_comment_field") as HTMLInputElement).value = resp.message;

  }

  return (
    <div>
      <button onClick={getNotes}>Generate Comment</button>  
    </div>
  )
}

export default PlasmoInline

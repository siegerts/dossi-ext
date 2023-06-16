import { LabelBadge } from "./LabelBadge"

const LabelList = ({ labels }) => {
  // add the delete label function here

  return (
    <>
      {labels &&
        labels.length > 0 &&
        labels.map((label) => (
          <LabelBadge key={label?.label?.id} label={label} />
        ))}
    </>
  )
}

export default LabelList

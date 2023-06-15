import { LabelBadge } from "./LabelBadge"

const LabelList = ({ labels, queryClient }) => {
  return (
    <>
      {labels?.data?.map((label) => (
        <LabelBadge key={label.id} label={label} />
      ))}
    </>
  )
}

export default LabelList

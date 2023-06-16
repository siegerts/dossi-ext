import { LabelBadge } from "./LabelBadge"

const LabelList = ({ labels, entityId, tabUrl }) => {
  // add the delete label function here

  return (
    <>
      {labels &&
        labels.length > 0 &&
        labels.map((label) => (
          <LabelBadge
            key={label?.label?.id}
            label={label}
            entityId={entityId}
            tabUrl={tabUrl}
          />
        ))}
    </>
  )
}

export default LabelList

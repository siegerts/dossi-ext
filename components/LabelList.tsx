import { LabelBadge } from "./LabelBadge"

const LabelList = ({ labels, queryClient, entityId, tabUrl }) => {
  // add the delete label function here

  return (
    <>
      {labels.map((label) => (
        <LabelBadge
          key={label?.label?.id}
          label={label}
          entityId={entityId}
          tabUrl={tabUrl}
          queryClient={queryClient}
        />
      ))}
    </>
  )
}

export default LabelList

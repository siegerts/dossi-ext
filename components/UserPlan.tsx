import { baseUrl } from "~lib/constants"

const UserPlan = () => {
  return (
    <>
      <a
        href={`${baseUrl}/dashboard/billing`}
        target="_blank"
        className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium no-underline">
        🎉
        <div
          data-orientation="vertical"
          role="none"
          className="mx-2 h-4 w-[1px] shrink-0 bg-border"></div>
        Upgrade to Pro
      </a>
    </>
  )
}

export default UserPlan

import { useAuth } from "@/contexts/user"

const UserPlan = () => {
  const user = useAuth()

  return (
    <>
      {user?.attrs?.role && (
        <div className="inline-flex items-center rounded-lg bg-muted bg-primary bg-secondary px-3 py-1 text-sm font-medium text-primary no-underline">
          🔧
          <div
            data-orientation="vertical"
            role="none"
            className="mx-2 h-4 w-[1px] shrink-0 bg-border"></div>
          logged in as {user?.attrs?.role}
        </div>
      )}
    </>
  )
}

export default UserPlan

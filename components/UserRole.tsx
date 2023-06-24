import { useAuth } from "@/contexts/user"

const UserPlan = () => {
  const user = useAuth()

  return (
    <>
      {user?.attrs?.role && (
        <div className="mr-2 inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium no-underline">
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

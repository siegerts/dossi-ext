import { baseUrl } from "~lib/constants"
import { usePlanData } from "@/contexts/plan"
import { Skeleton } from "@/components/ui/skeleton"

const UserPlan = () => {
  const { plan, status } = usePlanData()
  return (
    <>
      {status === "loading" && <Skeleton className="h-7 w-[120px]" />}
      {status === "success" && plan === "PRO" && (
        <div className="inline-flex items-center rounded-lg bg-muted bg-primary bg-secondary px-3 py-1 text-sm font-medium text-primary no-underline">
          🎉
          <div
            data-orientation="vertical"
            role="none"
            className="mx-2 h-4 w-[1px] shrink-0 bg-border text-primary-foreground"></div>
          {plan} plan
        </div>
      )}

      {status === "success" && plan !== "PRO" && (
        <div className="inline-flex items-center rounded-lg bg-muted bg-primary bg-secondary px-3 py-1 text-sm font-medium text-primary no-underline">
          <a
            href={`${baseUrl}/dashboard/billing`}
            target="_blank"
            className="flex no-underline">
            🎉
            <div
              data-orientation="vertical"
              role="none"
              className="mx-2 h-4 w-[1px] shrink-0 bg-border "></div>
            Upgrade to PRO
          </a>
        </div>
      )}
    </>
  )
}

export default UserPlan

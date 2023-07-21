import { baseUrl } from "~lib/constants"
import { usePlanData } from "@/contexts/plan"
import { Skeleton } from "@/components/ui/skeleton"
import { limitReached } from "@/lib/utils"

const UserPlan = () => {
  const { plan, counts, limits, status } = usePlanData()
  return (
    <>
      {status === "loading" && <Skeleton className="h-7 w-[120px]" />}
      {status === "success" && plan === "PRO" && (
        <div className="inline-flex items-center rounded-lg border border-slate-100 px-3 py-1 text-sm font-medium text-primary">
          🎉
          <div
            data-orientation="vertical"
            role="none"
            className="mx-2 h-4 w-[1px] shrink-0 bg-border text-primary-foreground"></div>
          {plan} plan
        </div>
      )}

      {status === "success" && plan !== "PRO" && (
        <>
          {limitReached(counts, limits, "notes") ||
          limitReached(counts, limits, "labels") ||
          limitReached(counts, limits, "pins") ? (
            <div className="my-2 ml-3 flex flex-wrap justify-end rounded-lg border border-slate-100 px-3 py-2 text-sm !shadow-sm">
              <div>You've reached one or more limits. </div>
              <a
                href={`${baseUrl}/dashboard/billing`}
                target="_blank"
                className="ml-1 flex no-underline">
                Upgrade to PRO
              </a>
            </div>
          ) : (
            <div className="inline-flex items-center rounded-lg bg-muted bg-primary bg-secondary px-3 py-1 text-sm font-medium text-primary no-underline">
              <a
                href={`${baseUrl}/dashboard/billing`}
                target="_blank"
                className="flex no-underline">
                Upgrade to PRO
              </a>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default UserPlan

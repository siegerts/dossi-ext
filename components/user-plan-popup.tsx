import { baseUrl } from "~lib/constants"
import { usePlanData } from "@/contexts/plan"
import { Skeleton } from "@/components/ui/skeleton"
import { limitReached } from "@/lib/utils"

const UserPlanPopup = () => {
  const { plan, counts, limits, status } = usePlanData()
  return (
    <>
      {status === "loading" && <Skeleton className="h-7 w-[120px]" />}

      {!(status === "success" && plan !== "PRO") && (
        <>
          {(limitReached(counts, limits, "notes") ||
            limitReached(counts, limits, "labels") ||
            limitReached(counts, limits, "pins")) && (
            <div className="my-2 flex flex-wrap rounded-md border !border-slate-200 px-3 py-2 text-sm !shadow-sm">
              <div>You've reached one or more limits. </div>
              <a
                href={`${baseUrl}/dashboard/billing`}
                target="_blank"
                className="bold flex font-medium text-blue-500  no-underline">
                Upgrade to PRO
              </a>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default UserPlanPopup

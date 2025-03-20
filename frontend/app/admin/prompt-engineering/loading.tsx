import { Skeleton } from "@/components/ui/skeleton";

export default function PromptEngineeringLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-12 w-96 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>

        <div className="space-y-8">
          <Skeleton className="h-12 w-full" />

          <div className="grid grid-cols-5 gap-4">
            {Array(25)
              .fill(null)
              .map((_, index) => (
                <Skeleton key={index} className="h-24 w-full" />
              ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

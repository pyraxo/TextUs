import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PromptEngineeringLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-10">
        <Skeleton className="h-10 w-80" />

        {/* Rubric Grid Card */}
        <Card className="w-full border border-gray-200 rounded-lg">
          <CardContent className="p-6">
            <div className="flex justify-between mb-6">
              <div className="flex gap-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>

            <div className="flex">
              {/* Gradient color bar */}
              <div className="w-6 mr-4">
                <Skeleton className="h-[270px] w-full" />
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4">
                {/* Column Headers */}
                <div>
                  <Skeleton className="h-8 w-full mb-4" />
                  <div className="flex flex-col gap-4">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                  </div>
                </div>

                <div>
                  <Skeleton className="h-8 w-full mb-4" />
                  <div className="flex flex-col gap-4">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                  </div>
                </div>

                <div>
                  <Skeleton className="h-8 w-full mb-4" />
                  <div className="flex flex-col gap-4">
                    {Array(5)
                      .fill(null)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save/Cancel Buttons */}
        <div className="flex justify-end gap-4 mb-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Chat Transcript Database */}
        <div>
          <Skeleton className="h-10 w-72 mb-4" />

          <Card className="w-full border border-gray-200 rounded-lg">
            <CardContent className="p-0">
              <div className="flex justify-end gap-2 p-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-y border-gray-200">
                    <TableHead className="w-12">
                      <Skeleton className="h-4 w-4" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-8" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-32" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(4)
                    .fill(null)
                    .map((_, index) => (
                      <TableRow
                        key={index}
                        className="border-b border-gray-200"
                      >
                        <TableCell className="pr-0 w-12">
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { NewScenarioDialog } from "@/components/trainer/new-scenario-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSchemeScenarios } from "@/hooks/use-scenarios";
import { Scenario } from "@/types/scenario";
import {
  ArrowLeft,
  Filter,
  Pencil,
  RefreshCw,
  Search,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: scenarios } = useSchemeScenarios(params.id);
  const handleScenarioCreate = (scenario: any) => {
    console.log("New scenario created:", scenario);
    toast.success(`"${scenario.title}" has been successfully created.`);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-8 pb-10">
        <div className="container mx-auto">
          <Link
            href="/trainer/schemes"
            className="inline-flex items-center text-muted-background hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          {/* Main heading */}
          <h1 className="text-3xl font-bold mb-2">Manage Scenarios</h1>

          {/* Subheading */}
          <h2 className="text-sm">
            Create, assign, and manage chat scenarios for your trainees.
          </h2>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto p-8">
        <h2 className="text-2xl font-semibold mb-2">Housing</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Description of the housing scenarios.
        </p>

        {/* Action buttons and search */}
        <div className="flex gap-4 items-center mb-6">
          <NewScenarioDialog onScenarioCreate={handleScenarioCreate} />

          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input placeholder="Search..." className="pl-10 w-[240px]" />
            </div>
          </div>

          <Button variant="outline" className="gap-2">
            <RefreshCw size={20} />
            Refresh
          </Button>

          <Button variant="outline" className="gap-2">
            <Filter size={20} />
            Filter
          </Button>
        </div>

        <Card className="border-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="text-primary-foreground">
                  <TableHead className="">Scenario Title</TableHead>
                  <TableHead className="">Created Date</TableHead>
                  {/* <TableHead className="text-primary-foreground">
                    Assigned To
                  </TableHead> */}
                  <TableHead className="text-center">Completion Rate</TableHead>
                  <TableHead className="text-center">Avg. Score</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios &&
                  scenarios.map((scenario: Scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell>{scenario.name}</TableCell>
                      <TableCell>{scenario.created_at}</TableCell>
                      {/* <TableCell>{scenario.assignedTo}</TableCell> */}
                      {/* <TableCell className="text-center">
                        {scenario.completion_rate}
                      </TableCell>
                      <TableCell className="text-center">
                        {scenario.avg_score}
                      </TableCell> */}
                      <TableCell className="flex justify-center">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="mb-[-4px] mt-[-4px]"
                          >
                            <Pencil size={20} />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="mb-[-4px] mt-[-4px]"
                          >
                            <Trash size={20} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-gray-500"
            disabled
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm" disabled>
            ...
          </Button>
          <Button variant="outline" size="sm">
            67
          </Button>
          <Button variant="outline" size="sm">
            68
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}

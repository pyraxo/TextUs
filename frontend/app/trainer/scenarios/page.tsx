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
import { useToast } from "@/lib/hooks/use-toast";
import { Filter, Pencil, RefreshCw, Search, Trash } from "lucide-react";
interface Scenario {
  id: string;
  title: string;
  createdDate: string;
  assignedTo: string;
  completionRate: string;
  avgScore: string;
  scheme: string;
}

const mockScenarios: Scenario[] = [
  {
    id: "1",
    title: "It starts with one",
    createdDate: "15 Jan 2025",
    assignedTo: "4 Trainees",
    completionRate: "3/4 (75%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
  {
    id: "2",
    title: "All I know",
    createdDate: "15 Jan 2025",
    assignedTo: "3 Trainees",
    completionRate: "1/3 (33%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
  {
    id: "3",
    title: "It's so unreal",
    createdDate: "15 Jan 2025",
    assignedTo: "7 Trainees",
    completionRate: "5/7 (71%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
  {
    id: "4",
    title: "Watch you go",
    createdDate: "15 Jan 2025",
    assignedTo: "2 Trainees",
    completionRate: "2/2 (100%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
  {
    id: "5",
    title: "I tried so hard and got so far",
    createdDate: "15 Jan 2025",
    assignedTo: "4 Trainees",
    completionRate: "1/4 (25%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
  {
    id: "6",
    title: "But in the end,",
    createdDate: "15 Jan 2025",
    assignedTo: "4 Trainees",
    completionRate: "1/4 (25%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
  {
    id: "7",
    title: "it doesn't even matter",
    createdDate: "15 Jan 2025",
    assignedTo: "4 Trainees",
    completionRate: "4/4 (100%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
  {
    id: "8",
    title: "I had to fall to lose it all",
    createdDate: "15 Jan 2025",
    assignedTo: "4 Trainees",
    completionRate: "1/4 (25%)",
    avgScore: "4.2/5",
    scheme: "Housing",
  },
];

export default function ScenariosPage() {
  const { toast } = useToast();

  const handleScenarioCreate = (scenario: any) => {
    console.log("New scenario created:", scenario);
    toast({
      title: "Scenario Created",
      description: `"${scenario.title}" has been successfully created.`,
      variant: "default",
      duration: 3000,
    });
  };

  return (
    <div className="bg-background">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-8 pb-8">
        <div className="container mx-auto px-4">
          {/* Main heading */}
          <h1 className="text-3xl font-bold mb-2">Manage Scenarios</h1>

          {/* Subheading */}
          <h2 className="text-sm">
            Create, assign, and manage chat scenarios for your trainees.
          </h2>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
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
                {mockScenarios.map((scenario) => (
                  <TableRow key={scenario.id} className="hover:bg-muted/50">
                    <TableCell>{scenario.title}</TableCell>
                    <TableCell>{scenario.createdDate}</TableCell>
                    {/* <TableCell>{scenario.assignedTo}</TableCell> */}
                    <TableCell className="text-center">
                      {scenario.completionRate}
                    </TableCell>
                    <TableCell className="text-center">
                      {scenario.avgScore}
                    </TableCell>
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
      </div>
    </div>
  );
}

"use client";

import { DataTable } from "@/components/scenarios/data-table";
import { NewScenarioDialog } from "@/components/trainer/new-scenario-dialog";
import {
  getScenarioColumns,
  ScenarioTableItem,
} from "@/components/trainer/scenario-columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchemeScenarios } from "@/hooks/use-scenarios";
import { useSchemes } from "@/hooks/use-schemes";
import { ArrowLeft, Filter, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: scenarios } = useSchemeScenarios(params.id);
  const { data: schemes } = useSchemes();
  const scheme = schemes?.find((scheme) => scheme.slug === params.id);

  const handleScenarioCreate = (scenario: any) => {
    console.log("New scenario created:", scenario);
    toast.success(`"${scenario.title}" has been successfully created.`);
  };

  // Transform scenarios into table items
  const tableData: ScenarioTableItem[] = scenarios || [];

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
          {scheme ? (
            <>
              <h1 className="text-3xl font-bold mb-2">
                {scheme?.name} Scenarios
              </h1>

              {/* Subheading */}
              <h2 className="text-sm">{scheme?.description}</h2>
            </>
          ) : (
            <Skeleton className="h-8 w-2/5" />
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto p-8">
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

        <DataTable
          columns={getScenarioColumns()}
          data={tableData}
          title="Scenarios"
        />
      </main>
    </div>
  );
}

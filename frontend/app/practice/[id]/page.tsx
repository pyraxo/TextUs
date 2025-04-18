"use client";

import {
  ScenarioTableItem,
  getCompletedColumns,
  getPendingColumns,
} from "@/components/scenarios/columns";
import { DataTable } from "@/components/scenarios/data-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActiveSession } from "@/hooks/use-active-session";
import { useAuth } from "@/hooks/use-auth";
import { useUserScenarioSessions } from "@/hooks/use-scenario-sessions";
import { useScenarios, useSchemeScenarios } from "@/hooks/use-scenarios";
import { useSchemes } from "@/hooks/use-schemes";
import { startScenario } from "@/lib/api/scenarios";
import { Scenario } from "@/types/scenario";
import { UserScenarioSession } from "@/types/user-scenario-session";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: schemes } = useSchemes();
  const scheme = schemes?.find((s) => s.slug === params.id);

  const [isStarting, setIsStarting] = useState<string | null>(null);
  const { data: activeSession } = useActiveSession(user?.id);
  const isTrainerOrAdmin =
    user?.user_type === "trainer" || user?.user_type === "admin";
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [recentlyCompletedCurrentPage, setRecentlyCompletedCurrentPage] =
    useState(1);
  const itemsPerPage = 5;

  // Get scenarios data
  const { data: scenarios, isLoading, error } = useSchemeScenarios(params.id);
  // Fetch all scenarios for active session lookup
  const { data: allScenarios } = useScenarios();

  // Get user scenario sessions data
  const { data: sessions } = useUserScenarioSessions(user?.id);

  // Get scheme name based on ID or use fallback
  const schemeName = scheme?.name || "Unknown Scheme";

  const schemeDescription = scheme?.description || "";

  // Find the scheme name for the ongoing session (activeSession)
  let ongoingSchemeName = "Unknown Scheme";
  if (activeSession && allScenarios && schemes) {
    const ongoingScenario = allScenarios.find(
      (s) => s.id === activeSession.scenario_id
    );
    if (ongoingScenario) {
      const ongoingScheme = schemes.find(
        (sch) => sch.id === ongoingScenario.scheme_id
      );
      if (ongoingScheme) {
        ongoingSchemeName = ongoingScheme.name;
      }
    }
  }

  // Transform scenarios into table items
  const tableItems: ScenarioTableItem[] =
    scenarios?.map((scenario: Scenario) => {
      const session = sessions?.find(
        (s: UserScenarioSession) => s.scenario_id === scenario.id
      );
      const isCompleted = session?.end_timestamp != null;

      // Check if this scenario is the active one
      const isActiveScenario = activeSession?.scenario_id === scenario.id;

      // Check if there's any active scenario at all
      const activeScenarioExists = activeSession !== null;

      return {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description || undefined,
        status: isCompleted ? "completed" : "pending",
        dateCompleted: session?.end_timestamp
          ? new Date(session.end_timestamp).toISOString()
          : undefined,
        metrics: session?.metrics,
        isActiveScenario,
        activeScenarioExists,
      };
    }) || [];

  // Filter scenarios by status
  const pendingScenarios = tableItems.filter(
    (item) => item.status === "pending"
  );
  const completedScenarios = tableItems.filter(
    (item) => item.status === "completed"
  );

  // Pagination logic for pending scenarios
  const pendingTotalPages = Math.ceil(pendingScenarios.length / itemsPerPage);
  const pendingStartIndex = (pendingCurrentPage - 1) * itemsPerPage;
  const pendingEndIndex = pendingStartIndex + itemsPerPage;
  const currentPendingScenarios = pendingScenarios.slice(
    pendingStartIndex,
    pendingEndIndex
  );

  // Pagination logic for completed scenarios
  const completedTotalPages = Math.ceil(
    completedScenarios.length / itemsPerPage
  );
  const completedStartIndex = (completedCurrentPage - 1) * itemsPerPage;
  const completedEndIndex = completedStartIndex + itemsPerPage;
  const currentCompletedScenarios = completedScenarios.slice(
    completedStartIndex,
    completedEndIndex
  );

  // Generate page numbers for navigation
  const generatePageNumbers = (currentPage: number, totalPages: number) => {
    const pages = [];
    if (totalPages <= itemsPerPage) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleStartScenario = async (scenarioId: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to start a scenario.");
      return;
    }

    try {
      setIsStarting(scenarioId);
      const response = await startScenario(scenarioId, user.id);

      // If we get here, the scenario started successfully
      // Update the active session in the query cache
      queryClient.setQueryData(["active-session", user.id], response);

      // Redirect to the session page
      router.push(`/conversations/${response.id}`);
    } catch (error) {
      console.error("Failed to start scenario:", error);

      // Try to get the specific error message from the backend
      let errorMessage = "Failed to start scenario. Please try again.";
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          errorMessage = parsed.detail || error.message;
        } catch {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsStarting(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-cpf-light-teal pt-10 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header content area */}
          <Link
            href="/practice"
            className="inline-flex items-center hover:text-foreground/80 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">
                {schemeName}
              </h1>
              <h2 className="text-sm">{schemeDescription}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 space-y-8">
        {/* Ongoing Scenario Card */}
        {activeSession && (
          <div className="mb-8">
            <Card className="w-full flex flex-col md:flex-row items-center justify-between bg-cpf-light-teal/60 border-0 shadow-none">
              <div className="p-6 text-lg text-foreground">
                You have an ongoing scenario under the{" "}
                <span className="font-semibold">{ongoingSchemeName}</span>{" "}
                scheme.
              </div>
              <div className="p-6 pt-0 md:pt-6 md:pl-0">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() =>
                    router.push(`/conversations/${activeSession.id}`)
                  }
                  className="w-full md:w-auto"
                >
                  Resume
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Pending Scenarios Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending Scenarios</h2>
          <DataTable
            columns={getPendingColumns({
              onStart: handleStartScenario,
              isStarting,
            })}
            data={currentPendingScenarios}
            showNewScenarioDialog={false}
          />
          {pendingScenarios.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                className="text-sm"
                disabled={pendingCurrentPage === 1}
                onClick={() => setPendingCurrentPage(pendingCurrentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {generatePageNumbers(pendingCurrentPage, pendingTotalPages).map(
                  (page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 py-2 text-sm"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${page}`}
                        variant={
                          pendingCurrentPage === page ? "default" : "outline"
                        }
                        className={
                          pendingCurrentPage === page
                            ? "bg-primary text-primary-foreground text-sm"
                            : "text-sm"
                        }
                        onClick={() => setPendingCurrentPage(page as number)}
                      >
                        {page}
                      </Button>
                    )
                )}
              </div>
              <Button
                variant="outline"
                className="text-sm"
                disabled={pendingCurrentPage === pendingTotalPages}
                onClick={() => setPendingCurrentPage(pendingCurrentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Completed Scenarios Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed Scenarios</h2>
          <DataTable
            columns={getCompletedColumns({
              onRetry: handleStartScenario,
              isStarting,
              activeSession,
              onResume: (sessionId: string) =>
                router.push(`/conversations/${sessionId}`),
            })}
            data={currentCompletedScenarios}
            showNewScenarioDialog={false}
          />
          {completedScenarios.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                className="text-sm"
                disabled={completedCurrentPage === 1}
                onClick={() =>
                  setCompletedCurrentPage(completedCurrentPage - 1)
                }
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {generatePageNumbers(
                  completedCurrentPage,
                  completedTotalPages
                ).map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-2 text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={`page-${page}`}
                      variant={
                        completedCurrentPage === page ? "default" : "outline"
                      }
                      className={
                        completedCurrentPage === page
                          ? "bg-primary text-primary-foreground text-sm"
                          : "text-sm"
                      }
                      onClick={() => setCompletedCurrentPage(page as number)}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                className="text-sm"
                disabled={completedCurrentPage === completedTotalPages}
                onClick={() =>
                  setCompletedCurrentPage(completedCurrentPage + 1)
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Recently Completed Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recently Completed</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Date Completed</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const recentSessions = (sessions || [])
                    .filter(
                      (s) =>
                        s.end_timestamp &&
                        s.scenario &&
                        s.scenario.scheme_id === scheme?.id
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.end_timestamp!).getTime() -
                        new Date(a.end_timestamp!).getTime()
                    );
                  const recentlyCompletedTotalPages = Math.ceil(
                    recentSessions.length / itemsPerPage
                  );
                  const recentlyCompletedStartIndex =
                    (recentlyCompletedCurrentPage - 1) * itemsPerPage;
                  const recentlyCompletedEndIndex =
                    recentlyCompletedStartIndex + itemsPerPage;
                  const currentRecentlyCompletedSessions = recentSessions.slice(
                    recentlyCompletedStartIndex,
                    recentlyCompletedEndIndex
                  );
                  if (recentSessions.length === 0) {
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-gray-500"
                        >
                          No recently completed sessions found for this scheme.
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return currentRecentlyCompletedSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {session.scenario?.name || session.scenario_id}
                      </TableCell>
                      <TableCell>
                        {session.end_timestamp
                          ? new Date(session.end_timestamp).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {session.metrics?.completion_rate !== undefined
                          ? `${Math.round(
                              session.metrics.completion_rate * 100
                            )}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() =>
                            router.push(`/conversations/${session.id}`)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls for Recently Completed */}
          {(() => {
            const recentSessions = (sessions || []).filter(
              (s) =>
                s.end_timestamp &&
                s.scenario &&
                s.scenario.scheme_id === scheme?.id
            );
            const recentlyCompletedTotalPages = Math.ceil(
              recentSessions.length / itemsPerPage
            );
            if (recentSessions.length > itemsPerPage) {
              return (
                <div className="flex justify-center items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="text-sm"
                    disabled={recentlyCompletedCurrentPage === 1}
                    onClick={() =>
                      setRecentlyCompletedCurrentPage(
                        recentlyCompletedCurrentPage - 1
                      )
                    }
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    {generatePageNumbers(
                      recentlyCompletedCurrentPage,
                      recentlyCompletedTotalPages
                    ).map((page: number | string, index: number) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-recent-${index}`}
                          className="px-2 py-2 text-sm"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={`recent-page-${page}`}
                          variant={
                            recentlyCompletedCurrentPage === page
                              ? "default"
                              : "outline"
                          }
                          className={
                            recentlyCompletedCurrentPage === page
                              ? "bg-primary text-primary-foreground text-sm"
                              : "text-sm"
                          }
                          onClick={() =>
                            setRecentlyCompletedCurrentPage(page as number)
                          }
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="text-sm"
                    disabled={
                      recentlyCompletedCurrentPage ===
                      recentlyCompletedTotalPages
                    }
                    onClick={() =>
                      setRecentlyCompletedCurrentPage(
                        recentlyCompletedCurrentPage + 1
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

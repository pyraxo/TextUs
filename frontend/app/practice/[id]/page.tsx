"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { startScenario } from "@/lib/api/scenarios";
import { useAuth } from "@/lib/hooks/use-auth";
import { useSchemeScenarios } from "@/lib/hooks/use-scenarios";
import { useToast } from "@/lib/hooks/use-toast";
import type { Scenario } from "@/types/scenario";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mock completed scenarios data
const completedScenarios = [
  {
    id: 1,
    scenario: "Hello, can you hear me?",
    dateCompleted: "17 March 2025",
    score: "71%",
    feedback: "No Feedback Available",
  },
  {
    id: 2,
    scenario: "I'm in California dreaming about who we used to be",
    dateCompleted: "17 March 2025",
    score: "85%",
    feedback: "No Feedback Available",
  },
  {
    id: 3,
    scenario: "When we were younger and free",
    dateCompleted: "10 March 2025",
    score: "74%",
    feedback: "No Feedback Available",
  },
];

// Map of scheme IDs to their display names
const schemeNames = {
  "home-ownership": "Home Ownership",
  retirement: "Retirement",
  healthcare: "Healthcare",
  education: "Education",
  "employer-services": "Employer Services",
  "housing-protection": "Housing Protection",
};

// Map of scheme IDs to their display descriptions
const schemeDescriptions = {
  "home-ownership": "Home Ownership Scheme",
  retirement: "Retirement Scheme",
  healthcare: "Healthcare Scheme",
  education: "Education Scheme",
  "employer-services": "Employer Services Scheme",
  "housing-protection": "Housing Protection Scheme",
};

export default function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState<string | null>(null);
  const isTrainerOrAdmin =
    user?.user_type === "trainer" || user?.user_type === "admin";
  const [savedCurrentPage, setSavedCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get scenarios data
  const { data: scenarios, isLoading, error } = useSchemeScenarios(params.id);

  // Get scheme name based on ID or use fallback
  const schemeName =
    schemeNames[params.id as keyof typeof schemeNames] || "Unknown Scheme";

  const schemeDescription =
    schemeDescriptions[params.id as keyof typeof schemeDescriptions] ||
    "Unknown Scheme";

  // Pagination logic for saved scenarios
  const savedTotalPages = Math.ceil((scenarios?.length || 0) / itemsPerPage);
  const savedStartIndex = (savedCurrentPage - 1) * itemsPerPage;
  const savedEndIndex = savedStartIndex + itemsPerPage;
  const currentSavedScenarios =
    scenarios?.slice(savedStartIndex, savedEndIndex) || [];

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
      toast({
        title: "Error",
        description: "You must be logged in to start a scenario.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      setIsStarting(scenarioId);
      await startScenario(scenarioId, user.id);
      // Redirect to the scenario page
      router.push(`/conversations/${scenarioId}`);
    } catch (error) {
      console.error("Failed to start scenario:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start scenario. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsStarting(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-[#E8F6F4] pt-10 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header content area */}
          {/* Back button */}
          <Link
            href="/practice"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{schemeName}</h1>
              <h2 className="text-sm">{schemeDescription}</h2>
            </div>
            {isTrainerOrAdmin && (
              <Button
                variant="default"
                className="bg-primary text-primary-foreground"
              >
                Edit Scheme
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 space-y-8">
        {/* Saved Scenarios Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Pending Scenarios</h2>
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Scenario</TableHead>
                    <TableHead className="w-[10%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span>Loading scenarios...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-red-500"
                      >
                        Error loading scenarios. Please try again later.
                      </TableCell>
                    </TableRow>
                  ) : currentSavedScenarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No pending scenarios found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSavedScenarios.map((scenario: Scenario) => (
                      <TableRow key={scenario.id}>
                        <TableCell>{scenario.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isStarting === scenario.id}
                            onClick={() => handleStartScenario(scenario.id)}
                          >
                            {isStarting === scenario.id
                              ? "Starting..."
                              : "Start Now"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Saved Scenarios Pagination */}
          {scenarios && scenarios.length > 0 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                className="text-sm"
                disabled={savedCurrentPage === 1}
                onClick={() => setSavedCurrentPage(savedCurrentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {generatePageNumbers(savedCurrentPage, savedTotalPages).map(
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
                          savedCurrentPage === page ? "default" : "outline"
                        }
                        className={
                          savedCurrentPage === page
                            ? "bg-primary text-primary-foreground text-sm"
                            : "text-sm"
                        }
                        onClick={() => setSavedCurrentPage(page as number)}
                      >
                        {page}
                      </Button>
                    )
                )}
              </div>
              <Button
                variant="outline"
                className="text-sm"
                disabled={savedCurrentPage === savedTotalPages}
                onClick={() => setSavedCurrentPage(savedCurrentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Completed Scenarios Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed Scenarios</h2>
          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Scenario</TableHead>
                    <TableHead className="w-[15%]">Date Completed</TableHead>
                    <TableHead className="w-[10%]">Score</TableHead>
                    <TableHead className="w-[25%]">Feedback</TableHead>
                    <TableHead className="w-[10%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCompletedScenarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No completed scenarios found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentCompletedScenarios.map((scenario) => (
                      <TableRow key={scenario.id}>
                        <TableCell>{scenario.scenario}</TableCell>
                        <TableCell>{scenario.dateCompleted}</TableCell>
                        <TableCell>{scenario.score}</TableCell>
                        <TableCell>{scenario.feedback}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Retry
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Completed Scenarios Pagination */}
          {completedScenarios.length > 0 && (
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
      </div>
    </div>
  );
}

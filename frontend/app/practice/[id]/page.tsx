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
import { useAuth } from "@/lib/hooks/use-auth";
import { useState } from "react";

// Mock assignments data
const assignments = [
  {
    id: 1,
    scheme: "Home Ownership Scheme",
    scenario: "Divorce Assets Distribution",
    expectedScore: "70%",
    completeBy: "27 March 2025",
    assignedBy: "Pamela",
  },
  {
    id: 2,
    scheme: "Home Ownership Scheme",
    scenario: "Divorce Assets Distribution",
    expectedScore: "70%",
    completeBy: "27 March 2025",
    assignedBy: "Pamela",
  },
];

// Mock saved scenarios data
const savedScenarios = [
  {
    id: 1,
    scenario: "Hello",
  },
  {
    id: 2,
    scenario: "It's me",
  },
  {
    id: 3,
    scenario: "I was wondering if after all these years you'd like to meet",
  },
];

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
  const isTrainerOrAdmin =
    user?.user_type === "trainer" || user?.user_type === "admin";
  const [savedCurrentPage, setSavedCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get scheme name based on ID or use fallback
  const schemeName =
    schemeNames[params.id as keyof typeof schemeNames] || "Unknown Scheme";

  const schemeDescription =
    schemeDescriptions[params.id as keyof typeof schemeDescriptions] ||
    "Unknown Scheme";

  // Pagination logic for saved scenarios
  const savedTotalPages = Math.ceil(savedScenarios.length / itemsPerPage);
  const savedStartIndex = (savedCurrentPage - 1) * itemsPerPage;
  const savedEndIndex = savedStartIndex + itemsPerPage;
  const currentSavedScenarios = savedScenarios.slice(
    savedStartIndex,
    savedEndIndex
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header content area */}
      <div className="bg-[#E8F6F4] pt-16 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-start">
            <div>
              {/* Main heading */}
              <h1 className="text-4xl font-bold mb-6">{schemeName}</h1>
              <p className="text-gray-600">{schemeDescription}</p>
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
          <h2 className="text-2xl font-semibold">Saved Scenarios</h2>
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
                  {currentSavedScenarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No saved scenarios found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSavedScenarios.map((scenario) => (
                      <TableRow key={scenario.id}>
                        <TableCell>{scenario.scenario}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Start Now
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
          {savedScenarios.length > 0 && (
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
                          ? "bg-primary text-sm text-primary-foreground"
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

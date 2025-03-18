import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

// Mock questions data
const questions = [
  {
    id: 1,
    question: "What is the role of CPF in Singapore's retirement system?",
    status: "Completed",
    difficulty: "Easy",
    score: "10/10",
  },
  {
    id: 2,
    question: "How does CPF LIFE work?",
    status: "In Progress",
    difficulty: "Medium",
    score: "5/10",
  },
  {
    id: 3,
    question: "What are the different CPF accounts and their purposes?",
    status: "Not Started",
    difficulty: "Hard",
    score: "-",
  },
  {
    id: 4,
    question: "How can CPF be used for housing needs?",
    status: "Completed",
    difficulty: "Medium",
    score: "8/10",
  },
  {
    id: 5,
    question: "What are the CPF contribution rates for different age groups?",
    status: "Not Started",
    difficulty: "Medium",
    score: "-",
  },
];

// Map of scheme IDs to their display names
const schemeNames = {
  "home-ownership": "Home Ownership",
  retirement: "Retirement",
  healthcare: "Healthcare",
  education: "Education",
  "employer-services": "Employer Services",
  "housing-protection": "Housing Protection Scheme",
};

export default function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Get scheme name based on ID or use fallback
  const schemeName =
    schemeNames[params.id as keyof typeof schemeNames] || "Scheme Overview";

  return (
    <div className="min-h-screen bg-white">
      {/* Header content area */}
      <div className="bg-[#E8F6F4] pt-16 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Main heading */}
          <h1 className="text-5xl font-bold mb-6">{schemeName}</h1>

          {/* Subheading */}
          <h2 className="text-xl font-normal">
            Which scheme would you like to learn about today?
          </h2>
        </div>
      </div>

      {/* Question Bank Section */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Question Bank</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Question</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">
                      {question.question}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          question.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : question.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {question.status}
                      </span>
                    </TableCell>
                    <TableCell>{question.difficulty}</TableCell>
                    <TableCell>{question.score}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/practice/${params.id}/question/${question.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

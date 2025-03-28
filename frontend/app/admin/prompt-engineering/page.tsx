"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for the transcript table
const transcriptData = [
  { id: 1, name: "chat transcript #1", date: "25/12/24" },
  { id: 2, name: "chat transcript #2", date: "14/12/24" },
  { id: 3, name: "chat transcript #3", date: "5/12/24" },
  { id: 4, name: "chat transcript #4", date: "21/11/24" },
];

export default function PromptEngineeringPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-10">
        <h1 className="text-3xl font-bold">Prompt Engineering Controls</h1>

        <Card className="w-full border border-gray-200 rounded-lg">
          <CardContent className="p-6">
            <div className="flex justify-between mb-6">
              <div className="flex gap-6">
                <span className="text-base font-medium">
                  Trainee's Replies Rubric
                </span>
                <span className="text-base font-medium text-gray-500">
                  Simulator Performance Rubric
                </span>
              </div>
              <Button
                size="sm"
                className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white h-8 px-4"
              >
                Edit
              </Button>
            </div>

            <div className="flex">
              {/* Gradient color bar */}
              <div className="w-6 mr-4 rounded-sm overflow-hidden">
                <div className="h-[52px] bg-[#e0edec]"></div>
                <div className="h-[52px] bg-[#a5c5c4]"></div>
                <div className="h-[52px] bg-[#6a9e9c]"></div>
                <div className="h-[52px] bg-[#2f7774]"></div>
                <div className="h-[52px] bg-[#004d4a]"></div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4">
                {/* Column Headers */}
                <div>
                  <div className="bg-[#0B6160] text-white font-semibold p-2 text-center mb-4 rounded-sm">
                    Accuracy
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Lousy
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Poor
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Average
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Good
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Best
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-[#0B6160] text-white font-semibold p-2 text-center mb-4 rounded-sm">
                    Comprehension
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Lousy
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Poor
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Average
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Good
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Best
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-[#0B6160] text-white font-semibold p-2 text-center mb-4 rounded-sm">
                    Tone
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Lousy
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Poor
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Average
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Good
                    </div>
                    <div className="border border-black rounded-sm p-2 text-center font-semibold">
                      Best
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mb-4">
          <Button className="bg-[#FC5A5A] hover:bg-[#FC5A5A]/90 text-white px-6">
            Cancel
          </Button>
          <Button className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white px-6">
            Save Changes
          </Button>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">Chat Transcript Database</h2>

          <Card className="w-full border border-gray-200 rounded-lg">
            <CardContent className="p-0">
              <div className="flex justify-end gap-2 p-2">
                <Button
                  size="sm"
                  className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white h-8"
                >
                  Export
                </Button>
                <Button
                  size="sm"
                  className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white h-8"
                >
                  Import
                </Button>
                <Button
                  size="sm"
                  className="bg-[#FC5A5A] hover:bg-[#FC5A5A]/90 text-white h-8"
                >
                  Delete
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-y border-gray-200">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-medium text-sm">s/n</TableHead>
                    <TableHead className="font-medium text-sm">
                      file name
                    </TableHead>
                    <TableHead className="font-medium text-sm">
                      upload date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transcriptData.map((transcript) => (
                    <TableRow
                      key={transcript.id}
                      className="border-b border-gray-200"
                    >
                      <TableCell className="pr-0 w-12">
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-normal">
                        {transcript.id}
                      </TableCell>
                      <TableCell className="font-normal">
                        {transcript.name}
                      </TableCell>
                      <TableCell className="font-normal">
                        {transcript.date}
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

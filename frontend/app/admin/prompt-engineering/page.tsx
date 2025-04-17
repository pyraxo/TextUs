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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRubrics } from "@/hooks/use-rubrics";
import { useEffect, useMemo, useState } from "react";

const METRICS = [
  { key: "accuracy", label: "Accuracy" },
  { key: "comprehension", label: "Comprehension" },
  { key: "tone", label: "Tone" },
  { key: "chat_handling", label: "Chat Handling" },
];

const transcriptData = [
  { id: 1, name: "chat transcript #1", date: "25/12/24" },
  { id: 2, name: "chat transcript #2", date: "14/12/24" },
  { id: 3, name: "chat transcript #3", date: "5/12/24" },
  { id: 4, name: "chat transcript #4", date: "21/11/24" },
];

const RUBRIC_API = "/api/rubrics";

// Map rubric keys for tabs
const rubricTabKeys = {
  trainee: "Trainee's Replies Rubric",
  simulator: "Simulator Performance Rubric",
};

// Map which metrics belong to which tab (assuming both tabs use the same metrics for now)
const TAB_METRICS = {
  trainee: METRICS,
  simulator: METRICS,
};

export default function PromptEngineeringPage() {
  const { rubrics, loading, error, saving, saveRubricPrompt } = useRubrics();
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].key);
  const [text, setText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find the rubric for the selected metric
  const selectedRubric = useMemo(
    () => rubrics.find((r) => r.id === selectedMetric),
    [rubrics, selectedMetric]
  );

  // When metric or rubrics change, update textarea
  useEffect(() => {
    setText(selectedRubric?.rubric_prompt || "");
    setDirty(false);
    setSaveSuccess(false);
    setSaveError(null);
  }, [selectedRubric]);

  // Handle textarea change
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    setDirty(e.target.value !== (selectedRubric?.rubric_prompt || ""));
    setSaveSuccess(false);
    setSaveError(null);
  }

  // Handle save
  async function handleSave() {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await saveRubricPrompt(selectedMetric, text);
      setDirty(false);
      setSaveSuccess(true);
    } catch (e: any) {
      setSaveError(e.message || "Failed to save");
    }
  }

  // Color bar colors
  const colorBarColors = [
    "#e0edec",
    "#a5c5c4",
    "#6a9e9c",
    "#2f7774",
    "#004d4a",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-8 pb-8">
        <div className="container mx-auto">
          {/* Main heading */}
          <h1 className="text-3xl font-bold mb-2">
            Prompt Engineering Controls
          </h1>

          {/* Subheading */}
          <h2 className="text-sm">
            Configure and manage the AI prompt engineering settings for the
            system
          </h2>
        </div>
      </div>

      <main className="container mx-auto p-6">
        <Card className="w-full border border-gray-200 rounded-lg mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Evaluator Rubric Prompt</h2>
            <Tabs
              value={selectedMetric}
              onValueChange={setSelectedMetric}
              className="mb-6"
            >
              <TabsList>
                {METRICS.map((m) => (
                  <TabsTrigger key={m.key} value={m.key} className="capitalize">
                    {m.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {METRICS.map((m) => (
                <TabsContent value={m.key} key={m.key}>
                  <div>
                    {loading ? (
                      <div className="text-gray-500">Loading...</div>
                    ) : error ? (
                      <div className="text-red-500">{error}</div>
                    ) : (
                      <>
                        <Textarea
                          id="rubric-prompt-textarea"
                          className="w-full mb-2 min-h-[400px]"
                          value={text}
                          onChange={handleChange}
                          disabled={saving}
                        />
                        <div className="flex gap-2 items-center">
                          <Button
                            onClick={handleSave}
                            disabled={!dirty || saving}
                            className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white"
                          >
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          {saveSuccess && (
                            <span className="text-green-600">Saved!</span>
                          )}
                          {saveError && (
                            <span className="text-red-600">{saveError}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4 mt-8">
            Chat Transcript Database
          </h2>

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
      </main>
    </div>
  );
}

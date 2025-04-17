"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const METRICS = [
  { key: "accuracy", label: "Accuracy" },
  { key: "comprehension", label: "Comprehension" },
  { key: "tone", label: "Tone" },
  { key: "chat_handling", label: "Chat Handling" },
];
const LEVELS = ["Lousy", "Poor", "Average", "Good", "Best"];

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
  // rubricsByTab: { trainee: { metric: rubric }, simulator: { metric: rubric } }
  const [rubricsByTab, setRubricsByTab] = useState<any>({
    trainee: {},
    simulator: {},
  });
  const [activeTab, setActiveTab] = useState("trainee");
  const [edit, setEdit] = useState<{
    open: boolean;
    metric: string;
    level: number;
    value: string;
    tab: string;
  }>({ open: false, metric: "", level: 0, value: "", tab: "" });
  const [loading, setLoading] = useState(false);

  // Fetch rubric data
  useEffect(() => {
    async function fetchRubrics() {
      setLoading(true);
      try {
        const res = await fetch(RUBRIC_API);
        const data = await res.json();
        // For demo: assign all metrics to both tabs (customize as needed)
        const byTab: any = { trainee: {}, simulator: {} };
        data.forEach((r: any) => {
          byTab.trainee[r.id] = r;
          byTab.simulator[r.id] = r;
        });
        setRubricsByTab(byTab);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchRubrics();
  }, []);

  // Open edit modal
  function handleEdit(tab: string, metric: string, level: number) {
    const rubric = rubricsByTab[tab]?.[metric];
    if (!rubric) return;
    setEdit({
      open: true,
      metric,
      level,
      value: rubric[`rubric_level_${level + 1}`],
      tab,
    });
  }

  // Save rubric edit
  async function handleSave() {
    const { tab, metric, level, value } = edit;
    const rubric = rubricsByTab[tab]?.[metric];
    if (!rubric) return;
    const updated = { ...rubric };
    updated[`rubric_level_${level + 1}`] = value;
    setLoading(true);
    try {
      await fetch(`${RUBRIC_API}/${metric}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setRubricsByTab((prev: any) => ({
        ...prev,
        [tab]: { ...prev[tab], [metric]: updated },
      }));
      setEdit({ ...edit, open: false });
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
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
        <Card className="w-full border border-gray-200 rounded-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="trainee">
                  Trainee's Replies Rubric
                </TabsTrigger>
                <TabsTrigger value="simulator">
                  Simulator Performance Rubric
                </TabsTrigger>
              </TabsList>
              {Object.entries(rubricTabKeys).map(([tabKey, tabLabel]) => (
                <TabsContent value={tabKey} key={tabKey}>
                  <div className="flex mt-6">
                    {/* Gradient color bar aligned with table rows */}
                    <div
                      className="flex flex-col mr-4 rounded-sm overflow-hidden self-stretch"
                      style={{ height: "100%", minHeight: 0 }}
                    >
                      {colorBarColors.map((color, idx) => (
                        <div
                          key={color}
                          style={{ background: color, flex: 1, minHeight: 0 }}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {METRICS.map((m) => (
                              <th
                                key={m.key}
                                className="bg-[#0B6160] text-white font-semibold p-2 text-center mb-4 rounded-sm"
                              >
                                {m.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {LEVELS.map((level, i) => (
                            <tr key={level} style={{ height: "64px" }}>
                              {METRICS.map((m) => (
                                <td
                                  key={m.key}
                                  className="p-2 text-center align-middle"
                                >
                                  <Dialog
                                    open={
                                      edit.open &&
                                      edit.metric === m.key &&
                                      edit.level === i &&
                                      edit.tab === tabKey
                                    }
                                    onOpenChange={(open) =>
                                      !open &&
                                      setEdit((e) => ({ ...e, open: false }))
                                    }
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full h-16 border border-black rounded-sm font-semibold text-xl"
                                        onClick={() =>
                                          handleEdit(tabKey, m.key, i)
                                        }
                                        disabled={
                                          loading ||
                                          !rubricsByTab[tabKey][m.key]
                                        }
                                        style={{
                                          cursor: rubricsByTab[tabKey][m.key]
                                            ? "pointer"
                                            : "not-allowed",
                                        }}
                                      >
                                        {rubricsByTab[tabKey][m.key]?.[
                                          `rubric_level_${i + 1}`
                                        ] || level}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Edit {m.label} - {level}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <input
                                        className="w-full border p-2 rounded mb-4"
                                        value={edit.value}
                                        onChange={(e) =>
                                          setEdit((prev) => ({
                                            ...prev,
                                            value: e.target.value,
                                          }))
                                        }
                                        autoFocus
                                      />
                                      <DialogFooter>
                                        <Button
                                          onClick={handleSave}
                                          disabled={loading}
                                        >
                                          Save
                                        </Button>
                                        <DialogClose asChild>
                                          <Button variant="outline">
                                            Cancel
                                          </Button>
                                        </DialogClose>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

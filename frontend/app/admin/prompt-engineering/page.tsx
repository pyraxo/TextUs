"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function PromptEngineeringPage() {
  const [activeTab, setActiveTab] = useState("model-chat");

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Prompt Engineering Controls
          </h1>
          <div className="text-sm breadcrumbs">
            <ul className="flex gap-2 text-gray-600">
              <li>Home</li>
              <li>/</li>
              <li>Schemes</li>
              <li>/</li>
              <li>Question Bank Modifier</li>
            </ul>
          </div>
        </div>

        <Tabs defaultValue="model-chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="model-chat">Model Chat DB</TabsTrigger>
            <TabsTrigger value="grading-rubrics">Grading Rubrics</TabsTrigger>
          </TabsList>

          <TabsContent value="model-chat">
            <Card>
              <CardHeader>
                <CardTitle>Model Chat Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {Array(25)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="h-24 bg-gray-400 border border-black rounded-md cursor-pointer hover:bg-gray-500 transition-colors"
                      />
                    ))}
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">
                    CRUD Functions, Filter, Export / Import excel
                  </h3>
                  <div className="flex gap-4">
                    <Button variant="outline">Create</Button>
                    <Button variant="outline">Import</Button>
                    <Button variant="outline">Export</Button>
                    <Input placeholder="Search..." className="max-w-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grading-rubrics">
            <Card>
              <CardHeader>
                <CardTitle>Rubrics Prompt Modifier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {Array(25)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="h-24 bg-gray-400 border border-black rounded-md cursor-pointer hover:bg-gray-500 transition-colors"
                      />
                    ))}
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">
                    CRUD Functions, Filter, Export / Import excel
                  </h3>
                  <div className="flex gap-4">
                    <Button variant="outline">Create</Button>
                    <Button variant="outline">Import</Button>
                    <Button variant="outline">Export</Button>
                    <Input placeholder="Search..." className="max-w-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

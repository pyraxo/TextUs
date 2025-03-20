import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, User, X } from "lucide-react";

// Dummy data - replace with your actual data
const customerInfo = {
  name: "Aaron Tua",
  caseId: "11-22-334-832D",
  startTime: "17 May 18:38 SGT",
  category: "Housing",
  chatInfo: {
    status: "Closed",
    subject: "Housing Inquiry",
    outcome: "Accepted",
    outcomeDetails: "Lorem ipsum etc...",
    caseAssessment: "Lorem ipsum etc...",
    surveyReason: "Lorem ipsum etc...",
    enquiry: "Lorem ipsum etc...",
    messagingUser: "Aaron Tua",
    times: {
      start: "17 May 2025 18:31 SGT",
      end: "17 May 2025 20:32 SGT",
      accept: "17 May 2025 18:45 SGT",
    },
    contactInfo: "+65 912345678",
    flags: {
      classified: true,
      transferredByOfficer: true,
    },
    assignedOfficer: "Brighton",
    scheme: "Housing Scheme",
  },
  feedback: {
    general: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    scenario: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    profile: {
      traits: ["Senior", "Impatient"],
    },
    tlComments: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  },
  scores: {
    comprehension: 50,
    tone: 25,
    accuracy: 62,
    totalScore: 56,
    timeTaken: "45:16",
    metrics: {
      metric1: {
        value: 64,
        comparison: "4m54s faster than average",
      },
      metric2: {
        value: 64,
        comparison: "5% lower than previous metric",
      },
    },
  },
};

export function CustomerInfo() {
  return (
    <Tabs defaultValue="chat-info" className="w-full">
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{customerInfo.name}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <div className="bg-[#EA9C9C] text-black px-3 py-1 rounded-full text-sm">
                {customerInfo.category}
              </div>
              <p className="text-sm text-muted-foreground">
                Case ID: {customerInfo.caseId}
              </p>
              <p className="text-sm text-muted-foreground">
                Start: {customerInfo.startTime}
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>

        <TabsList className="grid w-full grid-cols-3 p-0 bg-transparent">
          <TabsTrigger
            value="chat-info"
            className="data-[state=active]:bg-[#004D40] data-[state=active]:text-white rounded-none border-b-2 border-muted data-[state=active]:border-[#004D40] bg-transparent px-0 py-2"
          >
            Chat Info
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="data-[state=active]:bg-[#004D40] data-[state=active]:text-white rounded-none border-b-2 border-muted data-[state=active]:border-[#004D40] bg-transparent px-0 py-2"
          >
            Feedback
          </TabsTrigger>
          <TabsTrigger
            value="scores"
            className="data-[state=active]:bg-[#004D40] data-[state=active]:text-white rounded-none border-b-2 border-muted data-[state=active]:border-[#004D40] bg-transparent px-0 py-2"
          >
            Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat-info" className="p-6">
          <ScrollArea className="h-[600px] w-full pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Status</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={
                      customerInfo.chatInfo.status === "Open"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button
                    variant={
                      customerInfo.chatInfo.status === "Closed"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Closed
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Subject</h3>
                <p className="text-sm">{customerInfo.chatInfo.subject}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Outcome</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={
                      customerInfo.chatInfo.outcome === "Accepted"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accepted
                  </Button>
                  <Button
                    variant={
                      customerInfo.chatInfo.outcome === "Rejected"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rejected
                  </Button>
                </div>
              </div>

              {/* Add all other chat info fields */}
              {/* ... existing fields ... */}

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Flags</h3>
                <div className="flex flex-col space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customerInfo.chatInfo.flags.classified}
                      readOnly
                    />
                    <span>Classified</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customerInfo.chatInfo.flags.transferredByOfficer}
                      readOnly
                    />
                    <span>Transferred by Officer</span>
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="feedback" className="p-6">
          <ScrollArea className="h-[600px] w-full pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">General Feedback</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {customerInfo.feedback.general}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Scenario</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {customerInfo.feedback.scenario}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Customer Profile</h3>
                <div className="flex space-x-2">
                  {customerInfo.feedback.profile.traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-secondary rounded text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">
                  TL Comments & Feedback
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {customerInfo.feedback.tlComments}
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="scores" className="p-6">
          <ScrollArea className="h-[600px] w-full pr-4">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {customerInfo.scores.comprehension}%
                      </span>
                    </div>
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="4"
                        fill="transparent"
                        r="38"
                        cx="48"
                        cy="48"
                      />
                      <circle
                        className="text-primary stroke-current"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="transparent"
                        r="38"
                        cx="48"
                        cy="48"
                        strokeDasharray={`${
                          customerInfo.scores.comprehension * 2.4
                        } 240`}
                      />
                    </svg>
                  </div>
                  <span className="mt-2 font-semibold">Comprehension</span>
                </div>

                {/* Similar circles for Tone and Accuracy */}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Score</span>
                  <span className="text-4xl font-bold text-primary">
                    {customerInfo.scores.totalScore}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Time Taken</span>
                  <span className="text-2xl font-bold">
                    {customerInfo.scores.timeTaken}
                  </span>
                </div>

                {/* Add metrics comparison */}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
}

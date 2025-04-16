import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EvaluationResponse,
  getConversationEvaluation,
} from "@/lib/api/conversations";
import { useWebSocket } from "@/lib/providers/websocket-provider";
import {
  AlertCircle,
  Bug,
  Check,
  Clock,
  MessageSquare,
  RefreshCw,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

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

interface CustomerInfoProps {
  conversationId?: string | null;
  onChatEnd?: () => void;
}

export function CustomerInfo({ conversationId, onChatEnd }: CustomerInfoProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { lastMessage } = useWebSocket();
  const [showDebug, setShowDebug] = useState(false);

  // Function to fetch evaluation data
  const fetchEvaluation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      console.log("Fetching evaluation for conversation:", conversationId);
      const result = await getConversationEvaluation(conversationId);
      console.log("Received evaluation data:", result);
      setEvaluation(result);
    } catch (error) {
      console.error("Error fetching evaluation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for websocket events to know when evaluation is complete
  useEffect(() => {
    // Initial fetch when conversationId changes
    if (conversationId) {
      fetchEvaluation();
    }
  }, [conversationId]);

  // Watch for WebSocket events
  useEffect(() => {
    if (!lastMessage || !conversationId) return;

    try {
      // Check if it's an evaluation completed event for our conversation
      if (
        (lastMessage as any).type === "EVALUATION_COMPLETED" &&
        (lastMessage as any).conversationId === conversationId
      ) {
        console.log("Received EVALUATION_COMPLETED event:", lastMessage);
        fetchEvaluation();
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }, [lastMessage, conversationId]);

  return (
    <Tabs defaultValue="chat-info" className="w-full">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">{customerInfo.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {customerInfo.startTime}
                </div>
                {/* <div className="text-sm text-muted-foreground">
                  Case ID: {customerInfo.caseId}
                </div> */}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchEvaluation}
              title="Refresh Data"
              aria-label="Refresh Evaluation Data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDebug(!showDebug)}
              title="Debug Panel"
              aria-label="Toggle Debug Panel"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Debug panel */}
        {showDebug && (
          <div className="p-4 border-b bg-muted/20">
            <h3 className="font-semibold mb-2">Debug Info</h3>
            <div className="space-y-2 text-xs">
              <div>
                <strong>Conversation ID:</strong> {conversationId || "none"}
              </div>
              <div>
                <strong>Evaluation Status:</strong>{" "}
                {evaluation ? evaluation.evaluation_status : "not loaded"}
              </div>
              <div>
                <strong>Has Results:</strong>{" "}
                {evaluation?.evaluation_results ? "yes" : "no"}
              </div>
              {evaluation?.evaluation_results && (
                <div>
                  <strong>Results Keys:</strong>{" "}
                  {Object.keys(evaluation.evaluation_results).join(", ")}
                </div>
              )}
              <div className="border p-2 rounded bg-background overflow-auto max-h-20">
                <strong>Raw Data:</strong>
                <pre>
                  {evaluation ? JSON.stringify(evaluation, null, 2) : "null"}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <TabsList className="grid w-full grid-cols-3 p-0 bg-transparent border-b rounded-none h-[45px]">
          <TabsTrigger
            value="chat-info"
            className="relative data-[state=active]:bg-[#004D40] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-[#004D40] bg-transparent px-6 py-3 h-[45px] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-[#004D40]"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat Info
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="relative data-[state=active]:bg-[#004D40] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-[#004D40] bg-transparent px-6 py-3 h-[45px] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-[#004D40]"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger
            value="scores"
            className="relative data-[state=active]:bg-[#004D40] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-[#004D40] bg-transparent px-6 py-3 h-[45px] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-[#004D40]"
          >
            <Tag className="h-4 w-4 mr-2" />
            Scores
          </TabsTrigger>
        </TabsList>

        {/* Chat Info Content */}
        <TabsContent value="chat-info" className="p-6">
          <ScrollArea className="h-full w-full pr-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Status</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={
                      customerInfo.chatInfo.status === "Open"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Open
                  </Button>
                  <Button
                    variant={
                      customerInfo.chatInfo.status === "Closed"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Closed
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Subject</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.subject}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Outcome</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={
                      customerInfo.chatInfo.outcome === "Accepted"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Accepted
                  </Button>
                  <Button
                    variant={
                      customerInfo.chatInfo.outcome === "Rejected"
                        ? "default"
                        : "secondary"
                    }
                    size="sm"
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Rejected
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Outcome Details</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.outcomeDetails}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Case Assessment</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.caseAssessment}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Survey Reason</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.surveyReason}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Enquiry</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.enquiry}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Messaging User</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.messagingUser}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Times</h3>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm bg-muted p-3 rounded-lg">
                    <span>Start Time</span>
                    <span>{customerInfo.chatInfo.times.start}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-muted p-3 rounded-lg">
                    <span>End Time</span>
                    <span>{customerInfo.chatInfo.times.end}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-muted p-3 rounded-lg">
                    <span>Accept Time</span>
                    <span>{customerInfo.chatInfo.times.accept}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Contact Info</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.contactInfo}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Flags</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm bg-muted p-3 rounded-lg">
                    <span>Classified</span>
                    <Check
                      className={`h-4 w-4 ${
                        customerInfo.chatInfo.flags.classified
                          ? "text-green-500"
                          : "text-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm bg-muted p-3 rounded-lg">
                    <span>Transferred by Officer</span>
                    <Check
                      className={`h-4 w-4 ${
                        customerInfo.chatInfo.flags.transferredByOfficer
                          ? "text-green-500"
                          : "text-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Assigned Officer</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.assignedOfficer}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Scheme</h3>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {customerInfo.chatInfo.scheme}
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Feedback Content */}
        <TabsContent value="feedback" className="p-6">
          <ScrollArea className="h-full w-full pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : evaluation?.evaluation_status === "completed" &&
              evaluation?.evaluation_results ? (
              <div className="space-y-6">
                {/* Accuracy */}
                {evaluation.evaluation_results.accuracy && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-md">
                      Accuracy Assessment
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Score:</span>
                        <span className="text-primary font-bold">
                          {evaluation.evaluation_results.accuracy.score}/5
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Justification:</h4>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          {evaluation.evaluation_results.accuracy.justification}
                        </p>
                      </div>
                      {evaluation.evaluation_results.accuracy
                        .problematic_responses && (
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            Areas for Improvement:
                          </h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.accuracy
                                .problematic_responses
                            }
                          </p>
                        </div>
                      )}
                      {evaluation.evaluation_results.accuracy
                        .revised_response && (
                        <div className="space-y-1">
                          <h4 className="font-medium">Suggested Response:</h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.accuracy
                                .revised_response
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comprehension */}
                {evaluation.evaluation_results.comprehension && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-md">
                      Comprehension Assessment
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Score:</span>
                        <span className="text-primary font-bold">
                          {evaluation.evaluation_results.comprehension.score}/5
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Justification:</h4>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          {
                            evaluation.evaluation_results.comprehension
                              .justification
                          }
                        </p>
                      </div>
                      {evaluation.evaluation_results.comprehension
                        .problematic_responses && (
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            Areas for Improvement:
                          </h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.comprehension
                                .problematic_responses
                            }
                          </p>
                        </div>
                      )}
                      {evaluation.evaluation_results.comprehension
                        .revised_response && (
                        <div className="space-y-1">
                          <h4 className="font-medium">Suggested Response:</h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.comprehension
                                .revised_response
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tone */}
                {evaluation.evaluation_results.tone && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-md">Tone Assessment</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Score:</span>
                        <span className="text-primary font-bold">
                          {evaluation.evaluation_results.tone.score}/5
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Justification:</h4>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          {evaluation.evaluation_results.tone.justification}
                        </p>
                      </div>
                      {evaluation.evaluation_results.tone
                        .problematic_responses && (
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            Areas for Improvement:
                          </h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.tone
                                .problematic_responses
                            }
                          </p>
                        </div>
                      )}
                      {evaluation.evaluation_results.tone.revised_response && (
                        <div className="space-y-1">
                          <h4 className="font-medium">Suggested Response:</h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.tone
                                .revised_response
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Chat Handling */}
                {evaluation.evaluation_results.chat_handling && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-md">
                      Chat Handling Assessment
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Score:</span>
                        <span className="text-primary font-bold">
                          {evaluation.evaluation_results.chat_handling.score}/5
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">Justification:</h4>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          {
                            evaluation.evaluation_results.chat_handling
                              .justification
                          }
                        </p>
                      </div>
                      {evaluation.evaluation_results.chat_handling
                        .problematic_responses && (
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            Areas for Improvement:
                          </h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.chat_handling
                                .problematic_responses
                            }
                          </p>
                        </div>
                      )}
                      {evaluation.evaluation_results.chat_handling
                        .revised_response && (
                        <div className="space-y-1">
                          <h4 className="font-medium">Suggested Response:</h4>
                          <p className="text-sm bg-muted p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.chat_handling
                                .revised_response
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : evaluation?.evaluation_status === "pending" ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">
                  Evaluation in progress...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">General Feedback</h3>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {customerInfo.feedback.general}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Scenario Feedback</h3>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {customerInfo.feedback.scenario}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Customer Profile</h3>
                  <div className="flex flex-wrap gap-2">
                    {customerInfo.feedback.profile.traits.map((trait) => (
                      <div
                        key={trait}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {trait}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Team Lead Comments</h3>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {customerInfo.feedback.tlComments}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Scores Content */}
        <TabsContent value="scores" className="p-6">
          <ScrollArea className="h-full w-full pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : evaluation?.evaluation_status === "completed" &&
              evaluation?.evaluation_results ? (
              <div className="space-y-6">
                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Accuracy Score */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {evaluation.evaluation_results.accuracy
                            ? Math.round(
                                (evaluation.evaluation_results.accuracy.score /
                                  5) *
                                  100
                              )
                            : 0}
                          %
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
                            evaluation.evaluation_results.accuracy
                              ? (evaluation.evaluation_results.accuracy.score /
                                  5) *
                                240
                              : 0
                          } 240`}
                        />
                      </svg>
                    </div>
                    <span className="mt-2 font-semibold">Accuracy</span>
                  </div>

                  {/* Comprehension Score */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {evaluation.evaluation_results.comprehension
                            ? Math.round(
                                (evaluation.evaluation_results.comprehension
                                  .score /
                                  5) *
                                  100
                              )
                            : 0}
                          %
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
                            evaluation.evaluation_results.comprehension
                              ? (evaluation.evaluation_results.comprehension
                                  .score /
                                  5) *
                                240
                              : 0
                          } 240`}
                        />
                      </svg>
                    </div>
                    <span className="mt-2 font-semibold">Comprehension</span>
                  </div>

                  {/* Tone Score */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {evaluation.evaluation_results.tone
                            ? Math.round(
                                (evaluation.evaluation_results.tone.score / 5) *
                                  100
                              )
                            : 0}
                          %
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
                            evaluation.evaluation_results.tone
                              ? (evaluation.evaluation_results.tone.score / 5) *
                                240
                              : 0
                          } 240`}
                        />
                      </svg>
                    </div>
                    <span className="mt-2 font-semibold">Tone</span>
                  </div>

                  {/* Chat Handling Score */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {evaluation.evaluation_results.chat_handling
                            ? Math.round(
                                (evaluation.evaluation_results.chat_handling
                                  .score /
                                  5) *
                                  100
                              )
                            : 0}
                          %
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
                            evaluation.evaluation_results.chat_handling
                              ? (evaluation.evaluation_results.chat_handling
                                  .score /
                                  5) *
                                240
                              : 0
                          } 240`}
                        />
                      </svg>
                    </div>
                    <span className="mt-2 font-semibold">Chat Handling</span>
                  </div>
                </div>

                {/* Total Score */}
                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">
                        {evaluation.evaluation_results &&
                          (() => {
                            const metrics = [
                              "accuracy",
                              "comprehension",
                              "tone",
                              "chat_handling",
                            ];
                            const validMetrics = metrics.filter(
                              (m) => evaluation.evaluation_results[m]
                            );
                            if (validMetrics.length === 0) return 0;

                            const totalScore = validMetrics.reduce(
                              (acc, metric) =>
                                acc +
                                (evaluation.evaluation_results[metric]?.score ||
                                  0),
                              0
                            );

                            return Math.round(
                              (totalScore / validMetrics.length / 5) * 100
                            );
                          })()}
                        %
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Total Score
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : evaluation?.evaluation_status === "pending" ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">
                  Evaluation in progress...
                </p>
              </div>
            ) : (
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

                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {customerInfo.scores.tone}%
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
                            customerInfo.scores.tone * 2.4
                          } 240`}
                        />
                      </svg>
                    </div>
                    <span className="mt-2 font-semibold">Tone</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {customerInfo.scores.accuracy}%
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
                            customerInfo.scores.accuracy * 2.4
                          } 240`}
                        />
                      </svg>
                    </div>
                    <span className="mt-2 font-semibold">Accuracy</span>
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">
                        {customerInfo.scores.totalScore}%
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Total Score
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Time Taken: {customerInfo.scores.timeTaken}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Performance Metrics</h3>
                  <div className="space-y-2">
                    {Object.entries(customerInfo.scores.metrics).map(
                      ([key, metric]) => (
                        <div key={key} className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {metric.value}%
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {metric.comparison}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
}

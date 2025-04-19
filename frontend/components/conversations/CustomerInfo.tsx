import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useConversation } from "@/hooks/use-conversations";
import {
  EvaluationResponse,
  getConversation,
  getConversationEvaluation,
} from "@/lib/api/conversations";
import { useWebSocket } from "@/lib/providers/websocket-provider";
import {
  AlertCircle,
  Bug,
  Clock,
  MessageSquare,
  RefreshCw,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CustomerInfoProps {
  conversationId?: string | null;
  onChatEnd?: () => void;
  trainerFeedback?: string | null;
}

export function CustomerInfo({
  conversationId,
  onChatEnd,
  trainerFeedback: propTrainerFeedback,
}: CustomerInfoProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { lastMessage } = useWebSocket();
  const [showDebug, setShowDebug] = useState(false);
  const [fetchedTrainerFeedback, setFetchedTrainerFeedback] = useState<
    string | null
  >(null);
  const [auth, setAuth] = useState<"yes" | "no" | null>(null);
  const [authReason, setAuthReason] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [systemAccessed, setSystemAccessed] = useState("");
  const [survey, setSurvey] = useState<"yes" | "no" | null>(null);
  const [surveyReason, setSurveyReason] = useState("");
  const [caseAssessment, setCaseAssessment] = useState("");
  const { data: conversation, isLoading: conversationLoading } =
    useConversation(conversationId || "");
  const { user } = useAuth();

  // Fetch conversation details (for trainer_feedback) when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setFetchedTrainerFeedback(null);
      return;
    }
    getConversation(conversationId)
      .then((data) => {
        console.log("CustomerInfo fetched conversation:", data.conversation);
        setFetchedTrainerFeedback(data.conversation.trainer_feedback || null);
      })
      .catch(() => setFetchedTrainerFeedback(null));
  }, [conversationId]);

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
              <h2 className="text-xl font-semibold">{user?.name || "-"}</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {conversation?.conversation?.started_at
                    ? new Date(
                        conversation.conversation.started_at
                      ).toLocaleString()
                    : "-"}
                </div>
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
          <div className="p-4 border-b bg-card/20">
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
          {!conversationId ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground text-center">
                Select conversation to view Chat Info
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Add save logic here if needed
              }}
            >
              <ScrollArea className="h-full w-full pr-4">
                <div className="space-y-6">
                  {/* 2. Case created date/time */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Case Created</h3>
                    <p className="text-sm bg-card p-3 rounded-lg">
                      {conversation?.conversation?.started_at
                        ? new Date(
                            conversation.conversation.started_at
                          ).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  {/* 1. Authentication */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Authentication</h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={auth === "yes" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setAuth("yes")}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={auth === "no" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setAuth("no")}
                      >
                        No
                      </Button>
                    </div>
                    {auth === "no" && (
                      <Textarea
                        className="mt-2"
                        placeholder="Please provide reason for no authentication"
                        value={authReason}
                        onChange={(e) => setAuthReason(e.target.value)}
                        rows={2}
                      />
                    )}
                  </div>

                  {/* 3. Priority */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Priority</h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={priority === "High" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setPriority("High")}
                      >
                        High
                      </Button>
                      <Button
                        type="button"
                        variant={
                          priority === "Medium" ? "default" : "secondary"
                        }
                        size="sm"
                        onClick={() => setPriority("Medium")}
                      >
                        Medium
                      </Button>
                      <Button
                        type="button"
                        variant={priority === "Low" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setPriority("Low")}
                      >
                        Low
                      </Button>
                    </div>
                  </div>

                  {/* 4. Case Assessment */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Case Assessment</h3>
                    <Textarea
                      placeholder="Enter case assessment..."
                      value={caseAssessment}
                      onChange={(e) => setCaseAssessment(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* 5. System Accessed */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">System Accessed</h3>
                    <Select
                      value={systemAccessed}
                      onValueChange={setSystemAccessed}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="System A">System A</SelectItem>
                        <SelectItem value="System B">System B</SelectItem>
                        <SelectItem value="System C">System C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 6. Survey */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Survey</h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={survey === "yes" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setSurvey("yes")}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={survey === "no" ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setSurvey("no")}
                      >
                        No
                      </Button>
                    </div>
                    {survey === "no" && (
                      <Textarea
                        className="mt-2"
                        placeholder="Please provide reason for no survey"
                        value={surveyReason}
                        onChange={(e) => setSurveyReason(e.target.value)}
                        rows={3}
                      />
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      Save
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </form>
          )}
        </TabsContent>

        {/* Feedback Content */}
        <TabsContent value="feedback" className="p-6">
          {!conversationId ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground text-center">
                Select conversation to view Feedback
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full w-full pr-4">
              {/* Trainer Feedback at the top if present */}
              {(fetchedTrainerFeedback || propTrainerFeedback) && (
                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold text-md text-primary">
                    Trainer Feedback
                  </h3>
                  <p className="text-sm bg-primary/10 text-primary p-3 rounded-lg whitespace-pre-line">
                    {fetchedTrainerFeedback || propTrainerFeedback}
                  </p>
                </div>
              )}
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
                          <p className="text-sm bg-card p-3 rounded-lg">
                            {
                              evaluation.evaluation_results.accuracy
                                .justification
                            }
                          </p>
                        </div>
                        {evaluation.evaluation_results.accuracy
                          .problematic_responses && (
                          <div className="space-y-1">
                            <h4 className="font-medium">
                              Areas for Improvement:
                            </h4>
                            <p className="text-sm bg-card p-3 rounded-lg">
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
                            <p className="text-sm bg-card p-3 rounded-lg">
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
                            {evaluation.evaluation_results.comprehension.score}
                            /5
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Justification:</h4>
                          <p className="text-sm bg-card p-3 rounded-lg">
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
                            <p className="text-sm bg-card p-3 rounded-lg">
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
                            <p className="text-sm bg-card p-3 rounded-lg">
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
                          <p className="text-sm bg-card p-3 rounded-lg">
                            {evaluation.evaluation_results.tone.justification}
                          </p>
                        </div>
                        {evaluation.evaluation_results.tone
                          .problematic_responses && (
                          <div className="space-y-1">
                            <h4 className="font-medium">
                              Areas for Improvement:
                            </h4>
                            <p className="text-sm bg-card p-3 rounded-lg">
                              {
                                evaluation.evaluation_results.tone
                                  .problematic_responses
                              }
                            </p>
                          </div>
                        )}
                        {evaluation.evaluation_results.tone
                          .revised_response && (
                          <div className="space-y-1">
                            <h4 className="font-medium">Suggested Response:</h4>
                            <p className="text-sm bg-card p-3 rounded-lg">
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
                            {evaluation.evaluation_results.chat_handling.score}
                            /5
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Justification:</h4>
                          <p className="text-sm bg-card p-3 rounded-lg">
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
                            <p className="text-sm bg-card p-3 rounded-lg">
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
                            <p className="text-sm bg-card p-3 rounded-lg">
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
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground text-center">
                    Select conversation to view Feedback
                  </p>
                </div>
              )}
            </ScrollArea>
          )}
        </TabsContent>

        {/* Scores Content */}
        <TabsContent value="scores" className="p-6">
          {!conversationId ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground text-center">
                Select conversation to view Scores
              </p>
            </div>
          ) : (
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
                                  (evaluation.evaluation_results.accuracy
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
                              evaluation.evaluation_results.accuracy
                                ? (evaluation.evaluation_results.accuracy
                                    .score /
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
                                  (evaluation.evaluation_results.tone.score /
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
                              evaluation.evaluation_results.tone
                                ? (evaluation.evaluation_results.tone.score /
                                    5) *
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
                  <div className="bg-card p-6 rounded-lg">
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
                                  (evaluation.evaluation_results[metric]
                                    ?.score || 0),
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
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground text-center">
                    No score data available for this conversation
                  </p>
                </div>
              )}
            </ScrollArea>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}

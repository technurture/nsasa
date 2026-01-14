import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, X, BarChart3, Lock, CheckCircle2, Users, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Poll } from "@shared/mongoSchema";

interface PollWithVotes extends Omit<Poll, 'targetLevels'> {
  totalVotes?: number;
  hasVoted?: boolean;
  userVoteOptionId?: string;
  targetLevels?: string[];
}

interface PollVoter {
  optionId: string;
  optionText: string;
  votedAt: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    level: string;
    matricNumber: string;
  };
}

const AVAILABLE_LEVELS = ["100", "200", "300", "400", "500", "600"];

export default function PollManagement() {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [targetLevels, setTargetLevels] = useState<string[]>([]);
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);
  const [expandedPollId, setExpandedPollId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all polls
  const { data: polls = [], isLoading } = useQuery<PollWithVotes[]>({
    queryKey: ['/api/polls'],
  });

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || poll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch voters for expanded poll
  const { data: voters, isLoading: votersLoading } = useQuery<PollVoter[]>({
    queryKey: ['/api/polls', expandedPollId, 'voters'],
    enabled: !!expandedPollId,
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (data: { question: string; options: string[]; targetLevels: string[] }) => {
      const response = await apiRequest('POST', '/api/polls', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: "Poll created",
        description: "Your poll has been created successfully",
      });
      setQuestion("");
      setOptions(["", ""]);
      setTargetLevels([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Close poll mutation
  const closePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiRequest('PUT', `/api/polls/${pollId}/close`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: "Poll closed",
        description: "The poll has been closed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete poll mutation
  const deletePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const response = await apiRequest('DELETE', `/api/polls/${pollId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: "Poll deleted",
        description: "The poll has been deleted successfully",
      });
      setPollToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setPollToDelete(null);
    },
  });

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = () => {
    const validOptions = options.filter(opt => opt.trim() !== "");

    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please add at least 2 options",
        variant: "destructive",
      });
      return;
    }

    const pollData = {
      question: question.trim(),
      options: validOptions.map(text => text.trim()),
      targetLevels,
    };

    createPollMutation.mutate(pollData);
  };

  const handleLevelToggle = (level: string) => {
    setTargetLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Create Poll Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Poll</CardTitle>
          <CardDescription>
            Create a poll for students to vote on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question</Label>
            <Input
              id="question"
              data-testid="input-poll-question"
              placeholder="What would you like to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                disabled={options.length >= 10}
                data-testid="button-add-option"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>

            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  data-testid={`input-option-${index}`}
                />
                {options.length > 2 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveOption(index)}
                    data-testid={`button-remove-option-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Target Levels (leave empty for all levels)</Label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_LEVELS.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level}`}
                    checked={targetLevels.includes(level)}
                    onCheckedChange={() => handleLevelToggle(level)}
                    data-testid={`checkbox-level-${level}`}
                  />
                  <label
                    htmlFor={`level-${level}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Level {level}
                  </label>
                </div>
              ))}
            </div>
            {targetLevels.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Only students in levels {targetLevels.join(", ")} can vote
              </p>
            )}
          </div>

          <Button
            onClick={handleCreatePoll}
            disabled={createPollMutation.isPending}
            className="w-full"
            data-testid="button-create-poll"
          >
            {createPollMutation.isPending ? "Creating..." : "Create Poll"}
          </Button>
        </CardContent>
      </Card>

      {/* Polls List */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">All Polls</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPolls && filteredPolls.length > 0 ? (
          <div className="grid gap-4">
            {filteredPolls.map((poll) => (
              <Card key={poll._id} data-testid={`poll-card-${poll._id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{poll.question}</CardTitle>
                        {poll.status === 'closed' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Closed
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <span>Total Votes: {poll.totalVotes || 0}</span>
                        {poll.targetLevels && poll.targetLevels.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="text-muted-foreground">|</span>
                            <span>Levels: {poll.targetLevels.join(", ")}</span>
                          </span>
                        )}
                      </CardDescription>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {poll.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => closePollMutation.mutate(poll._id!)}
                          disabled={closePollMutation.isPending}
                          data-testid={`button-close-poll-${poll._id}`}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setPollToDelete(poll._id!)}
                        data-testid={`button-delete-poll-${poll._id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {poll.options.map((option) => {
                    const percentage = calculatePercentage(
                      option.votes || 0,
                      poll.totalVotes || 0
                    );

                    return (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{option.text}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {option.votes || 0} votes
                            </span>
                            <Badge variant="outline">{percentage}%</Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}

                  {/* View Voters Section */}
                  {(poll.totalVotes || 0) > 0 && (
                    <Collapsible
                      open={expandedPollId === poll._id}
                      onOpenChange={(open) => setExpandedPollId(open ? poll._id! : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          data-testid={`button-view-voters-${poll._id}`}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {expandedPollId === poll._id ? 'Hide Voters' : 'View Voters'}
                          {expandedPollId === poll._id ? (
                            <ChevronUp className="h-4 w-4 ml-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        {votersLoading ? (
                          <div className="text-center py-4 text-muted-foreground">
                            Loading voters...
                          </div>
                        ) : voters && voters.length > 0 ? (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                              <span>Name</span>
                              <span>Matric No.</span>
                              <span>Level</span>
                              <span>Voted For</span>
                            </div>
                            {voters.map((voter, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-muted last:border-b-0"
                                data-testid={`voter-row-${idx}`}
                              >
                                <span className="font-medium">
                                  {voter.user.firstName} {voter.user.lastName}
                                </span>
                                <span className="text-muted-foreground">
                                  {voter.user.matricNumber || 'N/A'}
                                </span>
                                <span className="text-muted-foreground">
                                  {voter.user.level || 'N/A'}
                                </span>
                                <Badge variant="secondary" className="w-fit">
                                  {voter.optionText}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No voter details available
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No polls created yet. Create your first poll above!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pollToDelete} onOpenChange={() => setPollToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this poll? This action cannot be undone and all votes will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pollToDelete && deletePollMutation.mutate(pollToDelete)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

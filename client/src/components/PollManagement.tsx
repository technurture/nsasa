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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, X, BarChart3, Lock, CheckCircle2 } from "lucide-react";
import type { Poll } from "@shared/mongoSchema";

interface PollWithVotes extends Poll {
  totalVotes?: number;
  hasVoted?: boolean;
  userVoteOptionId?: string;
}

export default function PollManagement() {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);

  // Fetch all polls
  const { data: polls, isLoading } = useQuery<PollWithVotes[]>({
    queryKey: ['/api/polls'],
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (data: { question: string; options: string[] }) => {
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
    };

    createPollMutation.mutate(pollData);
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
        <h2 className="text-2xl font-bold mb-4">All Polls</h2>
        
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
        ) : polls && polls.length > 0 ? (
          <div className="grid gap-4">
            {polls.map((poll) => (
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
                      <CardDescription>
                        Total Votes: {poll.totalVotes || 0}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
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

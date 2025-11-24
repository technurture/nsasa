import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Lock, BarChart3 } from "lucide-react";
import type { Poll } from "@shared/mongoSchema";

interface PollWithVotes extends Poll {
  totalVotes?: number;
  hasVoted?: boolean;
  userVoteOptionId?: string;
}

interface PollVoterProps {
  showOnlyActive?: boolean;
}

export default function PollVoter({ showOnlyActive = true }: PollVoterProps) {
  const { toast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Fetch polls
  const { data: polls, isLoading } = useQuery<PollWithVotes[]>({
    queryKey: ['/api/polls', showOnlyActive ? 'active' : 'all'],
    queryFn: async () => {
      const url = showOnlyActive ? '/api/polls?status=active' : '/api/polls';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch polls');
      return response.json();
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const response = await apiRequest('POST', `/api/polls/${pollId}/vote`, { optionId });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully",
      });
      // Clear selected option for this poll
      setSelectedOptions(prev => {
        const newState = { ...prev };
        delete newState[variables.pollId];
        return newState;
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

  const handleVote = (pollId: string) => {
    const optionId = selectedOptions[pollId];
    
    if (!optionId) {
      toast({
        title: "Error",
        description: "Please select an option",
        variant: "destructive",
      });
      return;
    }

    voteMutation.mutate({ pollId, optionId });
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const activePolls = polls?.filter(poll => poll.status === 'active') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Polls</h2>
          <p className="text-muted-foreground">
            {showOnlyActive ? "Vote on active polls" : "View all polls"}
          </p>
        </div>
        {activePolls.length > 0 && (
          <Badge variant="default" data-testid="badge-active-polls">
            {activePolls.length} Active
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="space-y-2">
                    <div className="h-10 bg-muted animate-pulse rounded" />
                    <div className="h-10 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : polls && polls.length > 0 ? (
        <div className="grid gap-4">
          {polls.map((poll) => {
            const hasVoted = poll.hasVoted || false;
            const isActive = poll.status === 'active';
            const userVote = poll.userVoteOptionId;

            return (
              <Card key={poll._id} data-testid={`poll-card-${poll._id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{poll.question}</CardTitle>
                        {isActive ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Closed
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Total Votes: {poll.totalVotes || 0}
                        {hasVoted && (
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            • You voted
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!hasVoted && isActive ? (
                    // Voting interface
                    <div className="space-y-4">
                      <RadioGroup
                        value={selectedOptions[poll._id!] || ""}
                        onValueChange={(value) => 
                          setSelectedOptions(prev => ({ ...prev, [poll._id!]: value }))
                        }
                        data-testid={`radio-group-${poll._id}`}
                      >
                        {poll.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-2 rounded-md border p-3 hover-elevate"
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={`${poll._id}-${option.id}`}
                              data-testid={`radio-option-${option.id}`}
                            />
                            <Label
                              htmlFor={`${poll._id}-${option.id}`}
                              className="flex-1 cursor-pointer font-normal"
                            >
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <Button
                        onClick={() => handleVote(poll._id!)}
                        disabled={voteMutation.isPending}
                        className="w-full"
                        data-testid={`button-vote-${poll._id}`}
                      >
                        {voteMutation.isPending ? "Voting..." : "Submit Vote"}
                      </Button>
                    </div>
                  ) : (
                    // Results view
                    <div className="space-y-3">
                      {poll.options.map((option) => {
                        const percentage = calculatePercentage(
                          option.votes || 0,
                          poll.totalVotes || 0
                        );
                        const isUserVote = hasVoted && userVote === option.id;

                        return (
                          <div
                            key={option.id}
                            className={`space-y-2 rounded-md border p-3 ${
                              isUserVote ? "border-primary bg-primary/5" : ""
                            }`}
                            data-testid={`poll-result-${option.id}`}
                          >
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium flex items-center gap-2">
                                {option.text}
                                {isUserVote && (
                                  <Badge variant="default" className="text-xs">
                                    Your Vote
                                  </Badge>
                                )}
                              </span>
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
                      {!isActive && (
                        <p className="text-center text-sm text-muted-foreground mt-4">
                          This poll has been closed
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {showOnlyActive 
                ? "No active polls at the moment. Check back later!"
                : "No polls available yet."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

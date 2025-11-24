import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface BlogEngagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogId: string;
  type: 'likes' | 'views';
}

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  level?: string;
}

export default function BlogEngagementDialog({
  open,
  onOpenChange,
  blogId,
  type,
}: BlogEngagementDialogProps) {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: [`/api/blogs/${blogId}/${type}/users`],
    enabled: open,
  });

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return 'User';
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.firstName) return user.firstName[0];
    if (user.lastName) return user.lastName[0];
    return 'U';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'likes' ? 'Liked by' : 'Viewed by'} ({users?.length || 0})
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                  data-testid={`user-${type}-${user._id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback>{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getDisplayName(user)}
                    </p>
                    {user.level && (
                      <p className="text-xs text-muted-foreground">
                        {user.level}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No {type === 'likes' ? 'likes' : 'views'} yet
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

import { usePrayerRequests } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function PrayerRequests() {
  const { data: requests, isLoading } = usePrayerRequests();

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Prayer Requests" 
        description="View and manage prayer requests submitted by members." 
      />

      <div className="grid gap-4">
        {requests?.map((req) => (
          <div 
            key={req.id} 
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-foreground">{req.user_name}</h3>
                  <Badge variant={req.status === 'pending' ? "secondary" : "outline"} className="capitalize">
                    {req.status}
                  </Badge>
                </div>
                <p className="text-foreground/80 leading-relaxed bg-secondary/30 p-4 rounded-lg">
                  "{req.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap bg-background border border-border/50 px-3 py-1.5 rounded-full self-start">
                <Calendar className="w-4 h-4" />
                {req.created_at ? format(new Date(req.created_at), 'MMM d, yyyy h:mm a') : 'Unknown date'}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-mono">Telegram ID: {req.telegram_id}</span>
              {/* Future: Add button to mark as reviewed */}
            </div>
          </div>
        ))}

        {requests?.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No prayer requests received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

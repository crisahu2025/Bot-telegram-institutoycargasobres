import { usePrayerRequests, useEnvelopeLoads, useMinistries } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { HeartHandshake, Mail, Church, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: requests, isLoading: reqLoading } = usePrayerRequests();
  const { data: envelopes, isLoading: envLoading } = useEnvelopeLoads();
  const { data: ministries, isLoading: minLoading } = useMinistries();

  const isLoading = reqLoading || envLoading || minLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your church bot activity." 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Prayer Requests"
          value={requests?.length || 0}
          icon={HeartHandshake}
          iconColor="text-rose-500"
        />
        <StatCard
          label="Envelope Loads"
          value={envelopes?.length || 0}
          icon={Mail}
          iconColor="text-blue-500"
        />
        <StatCard
          label="Active Ministries"
          value={ministries?.length || 0}
          icon={Church}
          iconColor="text-amber-500"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Prayer Requests */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Prayer Requests</h3>
            <Link href="/requests">
              <span className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {requests?.slice(0, 5).map((req) => (
              <div key={req.id} className="p-6 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{req.user_name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{req.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {req.created_at ? format(new Date(req.created_at), 'MMM d, h:mm a') : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
            {(!requests || requests.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                No requests found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Envelope Loads */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Envelopes</h3>
            <Link href="/envelopes">
              <span className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {envelopes?.slice(0, 5).map((env) => (
              <div key={env.id} className="p-6 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{env.user_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {env.ministry_name || "Unknown Ministry"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Leader: {env.leader_name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {env.created_at ? format(new Date(env.created_at), 'MMM d') : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
            {(!envelopes || envelopes.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                No envelopes found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

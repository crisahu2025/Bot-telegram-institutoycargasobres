import { useState } from "react";
import { useLeaders, useMinistries, useCreateLeader } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, User, Filter, CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertLeaderSchema } from "@shared/schema";

export default function Leaders() {
  const [selectedMinistry, setSelectedMinistry] = useState<string>("all");
  const { data: leaders, isLoading: leadersLoading } = useLeaders(selectedMinistry !== "all" ? parseInt(selectedMinistry) : undefined);
  const { data: ministries } = useMinistries();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (leadersLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Leaders" 
        description="Manage ministry leaders and their assignments."
      >
        <CreateLeaderDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </PageHeader>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="All Ministries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ministries</SelectItem>
            {ministries?.map((m) => (
              <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="p-4 font-semibold text-foreground">Name</th>
                <th className="p-4 font-semibold text-foreground">Ministry</th>
                <th className="p-4 font-semibold text-foreground">Status</th>
                <th className="p-4 font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {leaders?.map((leader) => {
                const ministryName = ministries?.find(m => m.id === leader.ministry_id)?.name;
                return (
                  <tr key={leader.id} className="group hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {leader.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{leader.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {ministryName ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {ministryName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      {leader.active ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {leaders?.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No leaders found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateLeaderDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const { data: ministries } = useMinistries();
  const createMutation = useCreateLeader();
  
  const form = useForm<z.infer<typeof insertLeaderSchema>>({
    resolver: zodResolver(insertLeaderSchema),
    defaultValues: {
      name: "",
      ministry_id: undefined,
      active: true
    }
  });

  const onSubmit = (data: z.infer<typeof insertLeaderSchema>) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Success", description: "Leader created successfully" });
        onOpenChange(false);
        form.reset();
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40">
          <Plus className="w-4 h-4" />
          Add Leader
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Leader</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} placeholder="John Doe" />
            {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Ministry</Label>
            <Select onValueChange={(val) => form.setValue("ministry_id", parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a ministry" />
              </SelectTrigger>
              <SelectContent>
                {ministries?.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Leader"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

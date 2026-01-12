import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, AlertCircle, Clock, Server } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { api } from "@shared/routes";

export default function ErrorLogs() {
  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: [api.errorLogs.list.path],
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Logs de Errores" 
        description="Seguimiento de problemas técnicos detectados en el bot y el panel." 
      />

      <div className="grid gap-4">
        {logs?.map((log) => (
          <div 
            key={log.id} 
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{log.message}</h3>
                  <Badge variant="outline" className="capitalize">
                    {log.source}
                  </Badge>
                </div>
                {log.stack && (
                  <pre className="text-[10px] font-mono bg-secondary/30 p-4 rounded-lg overflow-x-auto max-h-[200px] text-muted-foreground">
                    {log.stack}
                  </pre>
                )}
                {log.context && (
                  <div className="text-xs font-mono bg-secondary/20 p-2 rounded border border-border/50">
                    <strong>Context:</strong> {JSON.stringify(log.context, null, 2)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap bg-background border border-border/50 px-3 py-1.5 rounded-full self-start">
                <Clock className="w-4 h-4" />
                {format(new Date(log.created_at), 'd MMM, yyyy h:mm:ss a')}
              </div>
            </div>
          </div>
        ))}

        {logs?.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No se han registrado errores aún. ¡Excelente!</p>
          </div>
        )}
      </div>
    </div>
  );
}

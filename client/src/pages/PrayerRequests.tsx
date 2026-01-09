import { usePrayerRequests } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, Calendar, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type PrayerRequest } from "@shared/schema";

export default function PrayerRequests() {
  const { data: requests, isLoading } = usePrayerRequests();
  const [selected, setSelected] = useState<PrayerRequest | null>(null);

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Peticiones de Oración" 
        description="Ver y gestionar las peticiones de oración enviadas por los miembros." 
      />

      <div className="grid gap-4">
        {requests?.map((req) => (
          <div 
            key={req.id} 
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => setSelected(req)}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{req.user_name}</h3>
                  <Badge variant={req.status === 'pending' ? "secondary" : "outline"} className="capitalize">
                    {req.status === 'pending' ? 'Pendiente' : req.status}
                  </Badge>
                </div>
                <p className="text-foreground/80 leading-relaxed bg-secondary/30 p-4 rounded-lg line-clamp-2 italic">
                  "{req.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap bg-background border border-border/50 px-3 py-1.5 rounded-full self-start">
                <Calendar className="w-4 h-4" />
                {req.created_at ? format(new Date(req.created_at), 'd MMM, yyyy h:mm a') : 'Fecha desconocida'}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-mono">Telegram ID: {req.telegram_id}</span>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                <Eye className="w-4 h-4 mr-1" /> Ver detalle
              </Button>
            </div>
          </div>
        ))}

        {requests?.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No se han recibido peticiones de oración aún.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de Petición</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Persona</Label>
                  <p className="font-bold">{selected.user_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Telegram ID</Label>
                  <p className="font-mono text-xs">{selected.telegram_id}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Fecha de envío</Label>
                <p className="text-sm">{selected.created_at ? format(new Date(selected.created_at), 'PPPP p') : '-'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Motivo de Oración</Label>
                <div className="p-4 rounded-xl bg-secondary/30 border italic leading-relaxed">
                  "{selected.content}"
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

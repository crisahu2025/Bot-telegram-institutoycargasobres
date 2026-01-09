import { useState } from "react";
import { useMinistries, useCreateMinistry, useEnvelopeLoads } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Building, MessageCircle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertMinistrySchema } from "@shared/schema";

export default function Ministries() {
  const { data: ministries, isLoading } = useMinistries();
  const { data: envelopes } = useEnvelopeLoads();
  const [isOpen, setIsOpen] = useState(false);
  
  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Ministerios" 
        description="Administra los diferentes ministerios y visualiza sus cargas de sobres."
      >
        <CreateMinistryDialog open={isOpen} onOpenChange={setIsOpen} />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ministries?.map((ministry) => {
          const ministryEnvelopes = envelopes?.filter(e => e.ministry_name === ministry.name) || [];
          
          return (
            <div 
              key={ministry.id} 
              className="group bg-card rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Building className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary text-xs font-semibold">
                  <FileText className="w-3.5 h-3.5" />
                  {ministryEnvelopes.length} Sobres
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{ministry.name}</h3>
              
              <div className="space-y-3 mt-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Últimas Cargas</h4>
                {ministryEnvelopes.length > 0 ? (
                  <div className="space-y-2">
                    {ministryEnvelopes.slice(0, 3).map(env => (
                      <div key={env.id} className="text-xs flex justify-between items-center bg-secondary/30 p-2 rounded-lg">
                        <span className="font-medium truncate max-w-[120px]">{env.user_name}</span>
                        <span className="font-bold text-primary">${env.offering}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sin cargas registradas aún.</p>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-mono">ID: {ministry.id}</span>
                {ministry.whatsapp_link && (
                  <a 
                    href={ministry.whatsapp_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {ministries?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl bg-secondary/20">
            <Building className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay ministerios aún</h3>
            <p className="text-muted-foreground mb-4">Agrega tu primer ministerio para comenzar.</p>
            <Button onClick={() => setIsOpen(true)}>Crear Ministerio</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateMinistryDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const createMutation = useCreateMinistry();
  
  const form = useForm<z.infer<typeof insertMinistrySchema>>({
    resolver: zodResolver(insertMinistrySchema),
    defaultValues: {
      name: "",
      whatsapp_link: ""
    }
  });

  const onSubmit = (data: z.infer<typeof insertMinistrySchema>) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Éxito", description: "Ministerio creado correctamente" });
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
          Agregar Ministerio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Ministerio</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Ministerio</Label>
            <Input id="name" {...form.register("name")} placeholder="ej. Horeb" />
            {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Link de WhatsApp (Opcional)</Label>
            <Input id="whatsapp" {...form.register("whatsapp_link")} placeholder="https://chat.whatsapp.com/..." />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creando..." : "Crear Ministerio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

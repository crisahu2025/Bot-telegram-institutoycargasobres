import { useState } from "react";
import { useMinistries, useCreateMinistry, useEnvelopeLoads, useDeleteMinistry } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Building, MessageCircle, FileText, Eye, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertMinistrySchema, type EnvelopeLoad } from "@shared/schema";
import { format } from "date-fns";

export default function Ministries() {
  const { data: ministries, isLoading } = useMinistries();
  const { data: envelopes } = useEnvelopeLoads();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<string | null>(null);
  const [selectedEnvelope, setSelectedEnvelope] = useState<EnvelopeLoad | null>(null);
  const [ministryToDelete, setMinistryToDelete] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const { toast } = useToast();
  const deleteMutation = useDeleteMinistry();
  
  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  const handleDelete = () => {
    if (!ministryToDelete) return;
    deleteMutation.mutate({ id: ministryToDelete, password: deletePassword }, {
      onSuccess: () => {
        toast({ title: "Éxito", description: "Ministerio eliminado correctamente" });
        setMinistryToDelete(null);
        setDeletePassword("");
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  const filteredEnvelopes = selectedMinistry 
    ? envelopes?.filter(e => e.ministry_name === selectedMinistry) || []
    : [];

  return (
    <div className="space-y-8">
      <PageHeader 
        title={selectedMinistry ? `Sobres: ${selectedMinistry}` : "Ministerios"} 
        description={selectedMinistry ? "Detalle de cargas de sobres para este ministerio." : "Administra los diferentes ministerios y visualiza sus cargas de sobres."}
      >
        {selectedMinistry ? (
          <Button variant="outline" onClick={() => setSelectedMinistry(null)}>Volver a Ministerios</Button>
        ) : (
          <CreateMinistryDialog open={isOpen} onOpenChange={setIsOpen} />
        )}
      </PageHeader>

      {!selectedMinistry ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries?.map((ministry) => {
            const ministryEnvelopes = envelopes?.filter(e => e.ministry_name === ministry.name) || [];
            
            return (
              <div 
                key={ministry.id} 
                className="group bg-card rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer relative"
                onClick={() => setSelectedMinistry(ministry.name)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary text-xs font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      {ministryEnvelopes.length}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMinistryToDelete(ministry.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
              </div>
            );
          })}
          
          {ministries?.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl bg-secondary/20">
              <Building className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay ministerios aún</h3>
              <p className="text-muted-foreground mb-4">Agrega tu primer ministerio para comenzar.</p>
              <Button onClick={() => setIsOpen(true)}>Crear Ministerio</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-secondary/20">
                  <th className="p-4 font-semibold text-foreground">Usuario</th>
                  <th className="p-4 font-semibold text-foreground">Mentor</th>
                  <th className="p-4 font-semibold text-foreground">Asistencia</th>
                  <th className="p-4 font-semibold text-foreground">Monto</th>
                  <th className="p-4 font-semibold text-foreground">Fecha</th>
                  <th className="p-4 font-semibold text-foreground">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredEnvelopes.map((env) => (
                  <tr key={env.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{env.user_name}</td>
                    <td className="p-4">{env.mentor_name}</td>
                    <td className="p-4">{env.people_count}</td>
                    <td className="p-4 font-bold text-primary">${env.offering}</td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {env.created_at ? format(new Date(env.created_at), 'd MMM, yyyy') : '-'}
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedEnvelope(env)}>
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredEnvelopes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No hay sobres registrados para este ministerio.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Envelope Details Dialog */}
      <Dialog open={!!selectedEnvelope} onOpenChange={(open) => !open && setSelectedEnvelope(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle del Sobre</DialogTitle>
          </DialogHeader>
          {selectedEnvelope && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Usuario</Label>
                  <p className="font-medium">{selectedEnvelope.user_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Ministerio</Label>
                  <p className="font-medium">{selectedEnvelope.ministry_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Mentor</Label>
                  <p className="font-medium">{selectedEnvelope.mentor_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Asistencia</Label>
                  <p className="font-medium">{selectedEnvelope.people_count}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Monto Ofrenda</Label>
                  <p className="font-bold text-primary text-lg">${selectedEnvelope.offering}</p>
                </div>
              </div>
              {selectedEnvelope.photo_url && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Foto del Sobre</Label>
                  <div className="rounded-xl border overflow-hidden bg-secondary/20">
                    <img src={selectedEnvelope.photo_url} alt="Sobre" className="w-full h-auto object-contain max-h-[300px]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={ministryToDelete !== null} onOpenChange={(open) => !open && setMinistryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. Por favor ingresa la contraseña de administrador para continuar.
            </p>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={deletePassword} 
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Ingresa la contraseña"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMinistryToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar Ministerio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

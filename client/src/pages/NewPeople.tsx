import { useNewPeople } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, UserPlus } from "lucide-react";
import { format } from "date-fns";

export default function NewPeople() {
  const { data: people, isLoading } = useNewPeople();

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Personas Nuevas" 
        description="Lista de nuevos visitantes y conversos registrados a través del bot." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people?.map((person) => (
          <div key={person.id} className="bg-card rounded-xl border border-border/50 p-6 shadow-sm flex flex-col hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3 mb-4 border-b border-border/50 pb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">Telegram ID: {person.telegram_id}</p>
                <p className="text-xs text-muted-foreground">
                  Registrado por: <span className="font-semibold">{person.recorded_by}</span>
                </p>
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Detalles</h4>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-secondary/30 p-3 rounded-lg">
                {person.details}
              </p>
            </div>
            
            <div className="mt-4 pt-3 text-xs text-right text-muted-foreground">
              Agregado el {person.created_at ? format(new Date(person.created_at), 'd MMM, yyyy') : 'Fecha desconocida'}
            </div>
          </div>
        ))}
        
        {people?.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No hay personas nuevas registradas aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}

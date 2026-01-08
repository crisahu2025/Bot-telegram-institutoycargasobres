import { useEnvelopeLoads } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";

export default function EnvelopeLoads() {
  const { data: envelopes, isLoading } = useEnvelopeLoads();

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Carga de Sobres" 
        description='Registro de envíos para "Carga de Espiga".' 
      />

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th className="p-4 font-semibold text-foreground">Fecha</th>
                <th className="p-4 font-semibold text-foreground">Miembro</th>
                <th className="p-4 font-semibold text-foreground">Ministerio</th>
                <th className="p-4 font-semibold text-foreground">Líder/Mentor</th>
                <th className="p-4 font-semibold text-foreground">Ofrenda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {envelopes?.map((env) => (
                <tr key={env.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4 whitespace-nowrap text-muted-foreground">
                    {env.created_at ? format(new Date(env.created_at), 'd MMM, yyyy') : '-'}
                  </td>
                  <td className="p-4 font-medium text-foreground">{env.user_name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                      {env.ministry_name || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-foreground">{env.leader_name}</span>
                      {env.mentor_name && <span className="text-muted-foreground">Mentor: {env.mentor_name}</span>}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    ${env.offering || "0"}
                  </td>
                </tr>
              ))}
              {envelopes?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No se han registrado cargas de sobres aún.
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

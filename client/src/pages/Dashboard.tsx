import { useGoogleSheetsDashboard } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Loader2, HeartHandshake, Mail, Church, UserPlus, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { data, isLoading, error } = useGoogleSheetsDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Sincronizando con Google Sheets...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-destructive">
        Error al cargar los datos en vivo. Por favor intente más tarde.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Panel Administrador"
        description="Datos en tiempo real sincronizados desde Google Sheets."
      />

      {/* Global Stats Section */}
      <h2 className="text-xl font-bold tracking-tight mt-8">Resumen General</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          label="Sobres de Espiga"
          value={data.totalEspigas}
          icon={Mail}
          iconColor="text-blue-500"
        />
        <StatCard
          label="Asistentes (Aprox)"
          value={data.totalAsistentes}
          icon={Church}
          iconColor="text-indigo-500"
        />
        <StatCard
          label="Nuevas Personas"
          value={data.nuevasPersonas}
          icon={UserPlus}
          iconColor="text-emerald-500"
        />
        <StatCard
          label="Ofrendas Totales"
          value={`$${data.totalOfrendas.toLocaleString('es-AR')}`}
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <StatCard
          label="Peticiones de Oración"
          value={data.peticiones}
          icon={HeartHandshake}
          iconColor="text-rose-500"
        />
      </div>

      {/* Ministry Breakdown */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col mt-10">
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card/50">
          <h3 className="font-bold text-lg">Reporte por Espigas (Ministerio)</h3>
        </div>

        {data.ministerios.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Ministerio</th>
                  <th className="p-4 font-semibold text-center">Cant. Sobres</th>
                  <th className="p-4 font-semibold text-center">Asistentes</th>
                  <th className="p-4 font-semibold text-right">Ofrendas Acumuladas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.ministerios.map((min, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">{min.nombre}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-500/10 text-blue-500 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                        {min.espigas}
                      </span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">{min.asistentes}</td>
                    <td className="p-4 text-right font-medium text-green-600">
                      ${min.ofrendas.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No hay ministerios registrados en el Excel con datos aún.
          </div>
        )}
      </div>
    </div>
  );
}


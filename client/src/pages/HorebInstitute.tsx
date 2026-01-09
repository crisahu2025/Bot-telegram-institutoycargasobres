import { useInstituteEnrollments, useInstitutePayments } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, GraduationCap, ReceiptText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HorebInstitute() {
  const { data: enrollments, isLoading: enrollLoading } = useInstituteEnrollments();
  const { data: payments, isLoading: payLoading } = useInstitutePayments();

  if (enrollLoading || payLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Instituto Bíblico Horeb" 
        description="Gestión de alumnos, inscripciones y pagos." 
      />

      <Tabs defaultValue="enrollments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="enrollments" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Inscripciones
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <ReceiptText className="w-4 h-4" />
            Pagos del Mes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="mt-6">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/20">
                    <th className="p-4 font-semibold text-foreground">Alumno</th>
                    <th className="p-4 font-semibold text-foreground">Año</th>
                    <th className="p-4 font-semibold text-foreground">Materias</th>
                    <th className="p-4 font-semibold text-foreground">Matrícula</th>
                    <th className="p-4 font-semibold text-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {enrollments?.map((enroll) => (
                    <tr key={enroll.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{enroll.full_name}</td>
                      <td className="p-4">{enroll.main_year}</td>
                      <td className="p-4 max-w-xs truncate" title={enroll.subjects}>{enroll.subjects}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${enroll.paid_registration === 'SI' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {enroll.paid_registration}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {enroll.created_at ? format(new Date(enroll.created_at), 'd MMM, yyyy') : '-'}
                      </td>
                    </tr>
                  ))}
                  {(!enrollments || enrollments.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No hay inscripciones registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/20">
                    <th className="p-4 font-semibold text-foreground">Alumno</th>
                    <th className="p-4 font-semibold text-foreground">Fecha de Pago</th>
                    <th className="p-4 font-semibold text-foreground">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {payments?.map((pay) => (
                    <tr key={pay.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{pay.full_name}</td>
                      <td className="p-4 text-muted-foreground">
                        {pay.created_at ? format(new Date(pay.created_at), 'd MMM, yyyy h:mm a') : '-'}
                      </td>
                      <td className="p-4">
                        <a href={pay.photo_monthly} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> Ver Foto
                        </a>
                      </td>
                    </tr>
                  ))}
                  {(!payments || payments.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">No hay pagos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

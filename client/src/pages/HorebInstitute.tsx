import { useState } from "react";
import { useInstituteEnrollments, useInstitutePayments } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, GraduationCap, ReceiptText, Calendar, Search, ArrowUpDown, Eye } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function HorebInstitute() {
  const { data: enrollments, isLoading: enrollLoading } = useInstituteEnrollments();
  const { data: payments, isLoading: payLoading } = useInstitutePayments();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  if (enrollLoading || payLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const toggleSort = () => setSortOrder(prev => prev === "asc" ? "desc" : "asc");

  const filteredEnrollments = (enrollments || [])
    .filter(e => e.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const comparison = a.full_name.localeCompare(b.full_name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const filteredPayments = (payments || [])
    .filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const comparison = a.full_name.localeCompare(b.full_name);
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalEnrollments = enrollments?.length || 0;
  const totalPayments = payments?.length || 0;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Instituto Bíblico Horeb"
        description="Gestión integral de alumnos, inscripciones y seguimiento de pagos."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Alumnos</p>
            <h3 className="text-2xl font-bold">{totalEnrollments}</h3>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <ReceiptText className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pagos Registrados</p>
            <h3 className="text-2xl font-bold">{totalPayments}</h3>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Calendar className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ciclo Lectivo</p>
            <h3 className="text-2xl font-bold">2025</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de alumno..."
            className="pl-10 bg-background/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={toggleSort} className="gap-2 w-full md:w-auto hover:bg-primary/5">
          <ArrowUpDown className="w-4 h-4" />
          {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </Button>
      </div>

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
                    <th className="p-4 font-semibold text-foreground text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredEnrollments.map((enroll) => (
                    <tr key={enroll.id} className="hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedEnrollment(enroll)}>
                      <td className="p-4 font-medium text-foreground">{enroll.full_name}</td>
                      <td className="p-4">{enroll.main_year}</td>
                      <td className="p-4 max-w-xs truncate">{enroll.subjects}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" /> Detalles
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredEnrollments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No se encontraron inscripciones.</td>
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
                    <th className="p-4 font-semibold text-foreground text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{pay.full_name}</td>
                      <td className="p-4 text-muted-foreground">
                        {pay.created_at ? format(new Date(pay.created_at), 'd MMM, yyyy') : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <a href={pay.photo_monthly} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> Ver Foto
                        </a>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">No se encontraron pagos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <DialogContent className="no-transparency">
          <DialogHeader>
            <DialogTitle>Detalles del Alumno</DialogTitle>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Nombre Completo</Label>
                  <p className="font-bold">{selectedEnrollment.full_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Año de Inscripción</Label>
                  <p className="font-medium">{selectedEnrollment.main_year}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Materias Inscritas</Label>
                <div className="p-3 rounded-lg bg-secondary/30 border text-sm">
                  {selectedEnrollment.subjects}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Matrícula Pagada</Label>
                  <p className="font-medium">{selectedEnrollment.paid_registration}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Fecha</Label>
                  <p className="font-medium">{selectedEnrollment.created_at ? format(new Date(selectedEnrollment.created_at), 'PPPP') : '-'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Usuario Telegram</Label>
                <p className="text-xs font-mono">{selectedEnrollment.user_name} ({selectedEnrollment.telegram_id})</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

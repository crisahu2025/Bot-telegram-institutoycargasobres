import { useQuery } from "@tanstack/react-query";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvQpiGDeHf6BTm6YrTDiLaKXshDjKGnai_8nwrKsdrYv57eA5KJo-In3Dmugki5nvD/exec";

export interface GoogleSheetsDashboardData {
  totalEspigas: number;
  totalAsistentes: number;
  totalOfrendas: number;
  nuevasPersonas: number;
  peticiones: number;
  ministerios: {
    nombre: string;
    espigas: number;
    asistentes: number;
    ofrendas: number;
  }[];
}

export function useGoogleSheetsDashboard() {
  return useQuery({
    queryKey: ["google_sheets_dashboard"],
    queryFn: async (): Promise<GoogleSheetsDashboardData> => {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getResumen`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data from Google Sheets");
      return await res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time dashboard feel
  });
}

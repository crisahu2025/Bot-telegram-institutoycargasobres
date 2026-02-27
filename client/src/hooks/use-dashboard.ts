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

export interface Ministry {
  id: number;
  name: string;
  whatsapp_link?: string;
}

export interface EnvelopeLoad {
  id: number;
  user_name: string;
  ministry_name: string;
  mentor_name: string;
  people_count: string;
  offering: string;
  photo_url?: string;
  created_at?: string;
}

export interface Leader {
  id: number;
  name: string;
  ministry_id: number;
  active: boolean;
}

export interface PrayerRequest {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export interface NewPerson {
  id: number;
  recorded_by: string;
  details: string;
  created_at: string;
}

export function useGoogleSheetsDashboard() {
  return useQuery({
    queryKey: ["google_sheets_dashboard"],
    queryFn: async (): Promise<GoogleSheetsDashboardData> => {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getResumen`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return await res.json();
    },
    refetchInterval: 30000,
  });
}

export function useMinistries() {
  return useQuery({
    queryKey: ["ministries"],
    queryFn: async (): Promise<Ministry[]> => {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getMinistries`);
      if (!res.ok) throw new Error("Failed to fetch ministries");
      return await res.json();
    },
  });
}

export function useEnvelopeLoads() {
  return useQuery({
    queryKey: ["envelopes"],
    queryFn: async (): Promise<EnvelopeLoad[]> => {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getEnvelopes`);
      if (!res.ok) throw new Error("Failed to fetch envelopes");
      return await res.json();
    },
  });
}

export function useLeaders(ministryId?: number) {
  return useQuery({
    queryKey: ["leaders", ministryId],
    queryFn: async (): Promise<Leader[]> => {
      const url = `${APPS_SCRIPT_URL}?action=getLeaders${ministryId ? `&ministry_id=${ministryId}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch leaders");
      return await res.json();
    },
  });
}

export function usePrayerRequests() {
  return useQuery({
    queryKey: ["prayer_requests"],
    queryFn: async (): Promise<PrayerRequest[]> => {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getRequests`);
      if (!res.ok) throw new Error("Failed to fetch prayer requests");
      return await res.json();
    },
  });
}

export function useNewPeople() {
  return useQuery({
    queryKey: ["new_people"],
    queryFn: async (): Promise<NewPerson[]> => {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getNewPeople`);
      if (!res.ok) throw new Error("Failed to fetch new people");
      return await res.json();
    },
  });
}

// MUTATIONS (POST to Apps Script)

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateMinistry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; whatsapp_link?: string }) => {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "createMinistry", ...data }),
      });
      if (!res.ok) throw new Error("Failed to create ministry");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
    },
  });
}

export function useDeleteMinistry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: number; password?: string }) => {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteMinistry", ...data }),
      });
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || "Failed to delete ministry");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
    },
  });
}

// LEGACY STUBS (NOT IMPLEMENTED YET IN APPS SCRIPT BUT KEPT TO COMPILE)
export function useCreateLeader() { return { mutate: () => { }, isPending: false }; }
export function useInstituteEnrollments() { return { data: [], isLoading: false }; }
export function useInstitutePayments() { return { data: [], isLoading: false }; }
export function useErrorLogs() { return { data: [], isLoading: false }; }

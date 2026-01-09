import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Ministry, type Leader, type PrayerRequest, type EnvelopeLoad, type NewPerson } from "@shared/schema";

// === MINISTRIES ===
export function useMinistries() {
  return useQuery({
    queryKey: [api.ministries.list.path],
    queryFn: async () => {
      const res = await fetch(api.ministries.list.path);
      if (!res.ok) throw new Error("Failed to fetch ministries");
      return await res.json() as Ministry[];
    },
  });
}

export function useCreateMinistry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.ministries.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create ministry");
      return await res.json() as Ministry;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.ministries.list.path] }),
  });
}

// === LEADERS ===
export function useLeaders(ministryId?: number) {
  return useQuery({
    queryKey: [api.leaders.list.path, ministryId],
    queryFn: async () => {
      const url = ministryId 
        ? `${api.leaders.list.path}?ministry_id=${ministryId}` 
        : api.leaders.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch leaders");
      return await res.json() as Leader[];
    },
  });
}

export function useCreateLeader() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.leaders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create leader");
      return await res.json() as Leader;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.leaders.list.path] }),
  });
}

// === PRAYER REQUESTS ===
export function usePrayerRequests() {
  return useQuery({
    queryKey: [api.requests.list.path],
    queryFn: async () => {
      const res = await fetch(api.requests.list.path);
      if (!res.ok) throw new Error("Failed to fetch prayer requests");
      return await res.json() as PrayerRequest[];
    },
  });
}

// === ENVELOPE LOADS ===
export function useEnvelopeLoads() {
  return useQuery({
    queryKey: [api.envelopes.list.path],
    queryFn: async () => {
      const res = await fetch(api.envelopes.list.path);
      if (!res.ok) throw new Error("Failed to fetch envelope loads");
      return await res.json() as EnvelopeLoad[];
    },
  });
}

// === INSTITUTE ===
export function useInstituteEnrollments() {
  return useQuery({
    queryKey: [api.institute.enrollments.path],
    queryFn: async () => {
      const res = await fetch(api.institute.enrollments.path);
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return await res.json() as typeof import("@shared/schema").institute_enrollments.$inferSelect[];
    },
  });
}

export function useInstitutePayments() {
  return useQuery({
    queryKey: [api.institute.payments.path],
    queryFn: async () => {
      const res = await fetch(api.institute.payments.path);
      if (!res.ok) throw new Error("Failed to fetch payments");
      return await res.json() as typeof import("@shared/schema").institute_payments.$inferSelect[];
    },
  });
}

// === NEW PEOPLE ===
export function useNewPeople() {
  return useQuery({
    queryKey: [api.newPeople.list.path],
    queryFn: async () => {
      const res = await fetch(api.newPeople.list.path);
      if (!res.ok) throw new Error("Failed to fetch new people");
      return await res.json() as NewPerson[];
    },
  });
}

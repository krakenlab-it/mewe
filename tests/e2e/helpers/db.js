import { createServiceClient } from "./supabase.js";

const service = () => createServiceClient();

export async function getPairByCode(pairCode) {
  const { data, error } = await service()
    .from("pairs")
    .select("*")
    .eq("pair_code", pairCode.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getParticipants(pairId) {
  const { data, error } = await service()
    .from("participants")
    .select("*")
    .eq("pair_id", pairId)
    .order("role", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getResponses(participantId) {
  const { data, error } = await service()
    .from("responses")
    .select("*")
    .eq("participant_id", participantId);
  if (error) throw error;
  return data || [];
}

export async function getIndices(participantId) {
  const { data, error } = await service()
    .from("computed_indices")
    .select("*")
    .eq("participant_id", participantId);
  if (error) throw error;
  return data || [];
}

export async function getComparativeReport(pairId) {
  const { data, error } = await service()
    .from("comparative_reports")
    .select("*")
    .eq("pair_id", pairId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getIdentitiesForParticipant(participantId) {
  const { data, error } = await service()
    .from("participant_identities")
    .select("*")
    .eq("participant_id", participantId);
  if (error) throw error;
  return data || [];
}

export async function getAccessAttempts(pairCode) {
  const { data, error } = await service()
    .from("pair_access_attempts")
    .select("*")
    .eq("pair_code", pairCode.toUpperCase())
    .order("attempted_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAdminAuditForPair(pairId) {
  const { data, error } = await service()
    .from("admin_actions_audit")
    .select("*")
    .eq("pair_id", pairId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function countQuestions() {
  const { count, error } = await service()
    .from("questions")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

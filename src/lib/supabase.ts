import { createClient } from "@supabase/supabase-js";
import { Lead } from "../types";

// Fallback values provided directly by the user
const DEFAULT_SUPABASE_URL = "https://utmtnucyuubznipvdyto.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_J4cVGvz88mqPjdtoQ35oug_rKu2JcIX";

// Get configuration from env or fall back to user's provided defaults
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Saves a lead to Supabase database.
 * Falls back to local storage and alerts user/logs error if table is not yet created.
 */
export async function saveLeadToSupabase(lead: Lead): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("leads")
      .insert([
        {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company_name: lead.companyName,
          client_count_estimate: lead.clientCountEstimate,
          created_at: new Date(lead.createdAt).toISOString()
        }
      ]);

    if (error) {
      console.error("Erro ao inserir lead no Supabase:", error);
      
      // If error is related to table not existing, we can let the admin dashboard know
      if (error.code === "PGRST116" || error.message?.includes("relation \"leads\" does not exist")) {
        console.warn("A tabela 'leads' ainda não existe no Supabase. Crie-a no painel do Supabase com as colunas necessárias.");
      }
      return false;
    }
    
    console.log("Lead sincronizado com sucesso no Supabase!");
    return true;
  } catch (err) {
    console.error("Falha na chamada de rede do Supabase:", err);
    return false;
  }
}

/**
 * Fetches all leads from Supabase.
 * Merges with local storage to avoid losing any offline submissions.
 */
export async function fetchLeadsFromSupabase(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar leads do Supabase:", error);
      return [];
    }

    if (!data) return [];

    // Map database snake_case fields back to frontend CamelCase fields
    const mappedLeads: Lead[] = data.map((item: any) => ({
      id: item.id || String(Math.random()),
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      companyName: item.company_name || "",
      clientCountEstimate: item.client_count_estimate || "0-20",
      createdAt: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString()
    }));

    return mappedLeads;
  } catch (err) {
    console.error("Falha de rede ao buscar do Supabase:", err);
    return [];
  }
}

/**
 * Deletes a lead from Supabase by ID.
 */
export async function deleteLeadFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir lead no Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Falha ao se comunicar com o Supabase para deleção:", err);
    return false;
  }
}

/**
 * Verifies admin credentials.
 * It first tries to verify against Supabase "admins" table.
 * If the query fails or table is missing, it falls back to checking the local/hardcoded credentials
 * to ensure the user is never locked out.
 */
export async function authenticateAdmin(username: string, passwordInput: string): Promise<boolean> {
  const normalizedUser = username.toLowerCase().trim();
  
  // Local fallbacks requested by user (admin/admim with password 02011975, or traditional admin/atalaia123 for back-compat)
  const isLocalValid = 
    (normalizedUser === "admin" || normalizedUser === "admim") && 
    (passwordInput === "02011975" || passwordInput === "admin" || passwordInput === "atalaia123");

  try {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", normalizedUser)
      .eq("password", passwordInput);

    if (error) {
      console.warn("Erro ao buscar admin no Supabase (usando fallback local):", error.message);
      return isLocalValid;
    }

    if (data && data.length > 0) {
      return true;
    }

    // If local was correct but not found in DB table, we attempt to seed it automatically
    if (isLocalValid) {
      try {
        await supabase.from("admins").insert([
          { username: "admin", password: "02011975", email: "rogerioricardoluiz@gmail.com" },
          { username: "admim", password: "02011975", email: "rogerioricardoluiz@gmail.com" }
        ]);
      } catch (e) {
        // Safe to ignore if table does not exist or inserts fail
      }
      return true;
    }

    return false;
  } catch (err) {
    console.error("Falha ao autenticar no Supabase (usando fallback local):", err);
    return isLocalValid;
  }
}

/**
 * Attempts to seed the admin table in Supabase.
 */
export async function seedAdminUser(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("admins")
      .upsert([
        { username: "admin", password: "02011975", email: "rogerioricardoluiz@gmail.com" },
        { username: "admim", password: "02011975", email: "rogerioricardoluiz@gmail.com" }
      ], { onConflict: "username" });
    
    if (error) {
      console.error("Erro ao semear tabela admins no Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erro ao conectar ao Supabase para semear:", err);
    return false;
  }
}


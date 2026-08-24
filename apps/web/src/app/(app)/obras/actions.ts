"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ObraRow {
  id: string;
  tenant_id: string;
  nombre: string;
  cliente: string | null;
  ubicacion: string | null;
  created_at: string;
  updated_at: string;
}

export async function getObras() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching obras:", error);
    return [];
  }

  return data as ObraRow[];
}

export async function createObra(input: {
  nombre: string;
  cliente?: string;
  ubicacion?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.app_metadata.tenant_id) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        tenant_id: user.app_metadata.tenant_id,
        nombre: input.nombre,
        cliente: input.cliente || null,
        ubicacion: input.ubicacion || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating obra:", error);
    throw new Error("Failed to create obra");
  }

  revalidatePath("/obras");
  return data as ObraRow;
}

export async function updateObra(id: string, input: Partial<{
  nombre: string;
  cliente: string;
  ubicacion: string;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating obra:", error);
    throw new Error("Failed to update obra");
  }

  revalidatePath("/obras");
  return data as ObraRow;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface DocumentRow {
  id: string;
  tenant_id: string;
  project_id: string;
  doc_type: string;
  folio: string | null;
  titulo: string | null;
  status: string | null;
  notas_crudas: string | null;
  contenido: string | null;
  estructura: any | null;
  fotos: any | null;
  created_at: string;
  updated_at: string;
}

export async function getDocuments(projectId?: string) {
  const supabase = await createClient();
  let query = supabase.from("documents").select("*").order("updated_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return data as DocumentRow[];
}

export async function createDocument(input: {
  project_id: string;
  doc_type: string;
  folio?: string;
  titulo?: string;
  status?: string;
  notas_crudas?: string;
  contenido?: string;
  estructura?: any;
  fotos?: any;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.app_metadata.tenant_id) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        tenant_id: user.app_metadata.tenant_id,
        project_id: input.project_id,
        doc_type: input.doc_type,
        folio: input.folio || null,
        titulo: input.titulo || null,
        status: input.status || "borrador",
        notas_crudas: input.notas_crudas || null,
        contenido: input.contenido || null,
        estructura: input.estructura || null,
        fotos: input.fotos || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating document:", error);
    throw new Error("Failed to create document");
  }

  revalidatePath("/documentos");
  return data as DocumentRow;
}

export async function updateDocument(id: string, input: Partial<{
  folio: string;
  titulo: string;
  status: string;
  notas_crudas: string;
  contenido: string;
  estructura: any;
  fotos: any;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating document:", error);
    throw new Error("Failed to update document");
  }

  revalidatePath(`/documentos/${id}`);
  revalidatePath("/documentos");
  return data as DocumentRow;
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }

  revalidatePath("/documentos");
}

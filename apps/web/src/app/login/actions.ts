"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Comprobar si el usuario tiene tenant_id en su app_metadata
  const { data: { user } } = await supabase.auth.getUser();
  if (user && !user.app_metadata.tenant_id) {
     redirect("/onboarding");
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Redirigir a la página para crear la organización (onboarding) ya que el usuario es nuevo
  // y no tiene tenant_id todavía.
  redirect("/onboarding");
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  // NEXT_PUBLIC_SITE_URL or window.location.origin equivalent logic needed.
  // We'll redirect back to a callback route which handles setting up the session.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

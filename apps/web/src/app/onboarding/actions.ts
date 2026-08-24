"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createOrganization(formData: FormData) {
  const orgName = formData.get("orgName") as string;
  if (!orgName) return { error: "Organization name is required." };

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized." };
  }

  if (user.app_metadata?.tenant_id) {
    redirect("/"); // already has tenant
  }

  // We need service role to bypass RLS and update auth.users.
  // Use @supabase/supabase-js directly to avoid passing user cookies,
  // ensuring the service role key genuinely bypasses RLS.
  const serviceRoleSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Create the tenant
  const { data: tenantData, error: tenantError } = await serviceRoleSupabase
    .from("tenants")
    .insert({ name: orgName, plan: "free" })
    .select("id")
    .single();

  if (tenantError || !tenantData) {
    return { error: tenantError?.message || "Error creating tenant." };
  }

  const tenantId = tenantData.id;

  // 2. Insert the user into public.users
  const { error: insertUserError } = await serviceRoleSupabase
    .from("users")
    .insert({
      id: user.id,
      tenant_id: tenantId,
      email: user.email!,
      role: "admin",
    });

  if (insertUserError) {
    return { error: insertUserError.message };
  }

  // 3. Update auth.users app_metadata with the new tenant_id
  const { error: updateAuthError } = await serviceRoleSupabase.auth.admin.updateUserById(
    user.id,
    { app_metadata: { tenant_id: tenantId } }
  );

  if (updateAuthError) {
    return { error: updateAuthError.message };
  }

  // To refresh the session, we use the regular client.
  await supabase.auth.refreshSession();

  redirect("/");
}

import { AppShell } from "@/components/app/AppShell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.app_metadata.tenant_id) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}

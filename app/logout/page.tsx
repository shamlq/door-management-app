"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    async function logout() {
      const supabase = createClient();

      await supabase.auth.signOut();

      window.location.href = "/login";
    }

    logout();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Signing out...
    </div>
  );
}

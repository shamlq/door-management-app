"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  user: any;
};

export function EditUserForm({ user }: Props) {
  const supabase = createClient();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [isAdmin, setIsAdmin] = useState(user?.is_admin ?? false);
  const [isActive, setIsActive] = useState(user?.is_active ?? true);

  async function handleSave() {
    const { error } = await supabase
      .from("users")
      .update({
        name,
        email,
        phone,
        is_admin: isAdmin,
        is_active: isActive,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("User updated successfully");
    window.location.reload();
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="space-y-4">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border p-2"
          placeholder="Name"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-2"
          placeholder="Email"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border p-2"
          placeholder="Phone"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          Admin User
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Save Changes
        </button>
      </div>
    </section>
  );
}
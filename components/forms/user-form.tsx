"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UserForm() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);

  async function handleCreateUser() {
    if (!name || !email) {
      alert("Name and Email are required");
      return;
    }

    const { error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          phone,
          is_admin: isAdmin,
          is_active: isActive,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("User created successfully");

    setName("");
    setEmail("");
    setPhone("");
    setIsAdmin(false);
    setIsActive(true);

    window.location.reload();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">
        User Details
      </h2>

      <div className="space-y-4">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border p-2"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-2"
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border p-2"
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
          onClick={handleCreateUser}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Create User
        </button>
      </div>
    </section>
  );
}
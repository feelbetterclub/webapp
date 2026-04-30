"use client";

import { useState, useEffect } from "react";
import { Trash2, Mail, Phone } from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface Member {
  id: number;
  name: string;
  email: string;
  phonePrefix: string | null;
  phone: string | null;
  createdAt: string;
}

export default function CommunityPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/community");
      if (res.ok) setMembers(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Remove this community member?")) return;
    await fetch(`/api/admin/community?id=${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-deep">Community Members</h1>
          <p className="text-sm text-muted-foreground mt-1">{members.length} members registered via free class pop-up</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-brand-sage/30 p-12 text-center text-muted-foreground">
          No community members yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-sage/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-sage/20 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-brand-sage/10 hover:bg-brand-light/30">
                  <td className="px-6 py-3 font-medium text-brand-deep">{m.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.email}</span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {m.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.phonePrefix || ""}{m.phone}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600 p-1" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import SubjectForm from "@/components/forms/SubjectForm";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load subjects");
      setSubjects(data.subjects || []);
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createSubject(values) {
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to create subject");
    toast.success("Subject created");
    setShowCreate(false);
    await load();
  }

  async function updateSubject(id, values) {
    const res = await fetch(`/api/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to update subject");
    toast.success("Subject updated");
    setEditingId(null);
    await load();
  }

  async function deleteSubject(id) {
    if (!confirm("Delete this subject? This will remove tests and questions too.")) return;
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to delete subject");
    toast.success("Subject deleted");
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Subjects</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Create subjects and manage their tests.
          </p>
        </div>
        <Button onClick={() => setShowCreate((s) => !s)} variant="primary">
          {showCreate ? "Close" : "Add Subject"}
        </Button>
      </div>

      {showCreate ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <SubjectForm submitLabel="Create Subject" onSubmit={createSubject} />
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-zinc-600">Loading...</div>
      ) : subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
          No subjects yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {subjects.map((s) => (
            <div key={s.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <img
                    src={s.thumbnail}
                    alt={s.title}
                    className="h-16 w-16 rounded-lg object-cover border border-zinc-200"
                  />
                  <div>
                    <div className="text-base font-semibold">{s.title}</div>
                    <div className="mt-1 text-sm text-zinc-600 line-clamp-2">
                      {s.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/subjects/${s.id}`}>
                    <Button variant="secondary">View</Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingId((cur) => (cur === s.id ? null : s.id))}
                  >
                    {editingId === s.id ? "Close" : "Edit"}
                  </Button>
                  <Button variant="danger" onClick={() => deleteSubject(s.id)}>
                    Delete
                  </Button>
                </div>
              </div>

              {editingId === s.id ? (
                <div className="mt-5 border-t border-zinc-200 pt-5">
                  <SubjectForm
                    initialValues={s}
                    submitLabel="Save Changes"
                    onSubmit={(values) => updateSubject(s.id, values)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import SubjectForm from "@/components/forms/SubjectForm";
import TestForm from "@/components/forms/TestForm";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = useMemo(() => Number(params?.id), [params]);

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTest, setShowAddTest] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);

  async function load() {
    if (!Number.isFinite(subjectId)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subjects/${subjectId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load subject");
      setSubject(data.subject);
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [subjectId]);

  async function updateSubject(values) {
    const res = await fetch(`/api/subjects/${subjectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to update subject");
    toast.success("Subject updated");
    setShowEditSubject(false);
    await load();
  }

  async function createTest(values) {
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, ...values }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to create test");
    toast.success("Test created");
    setShowAddTest(false);
    await load();
  }

  async function deleteTest(id) {
    if (!confirm("Delete this test? This will remove its questions too.")) return;
    const res = await fetch(`/api/tests/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to delete test");
    toast.success("Test deleted");
    await load();
  }

  async function deleteSubject() {
    if (!confirm("Delete this subject? This will remove tests and questions too.")) return;
    const res = await fetch(`/api/subjects/${subjectId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to delete subject");
    toast.success("Subject deleted");
    router.push("/subjects");
    router.refresh();
  }

  if (loading) return <div className="text-sm text-zinc-600">Loading...</div>;
  if (!subject) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-zinc-600">Subject not found.</div>
        <Link href="/subjects">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={subject.thumbnail}
            alt={subject.title}
            className="h-20 w-20 rounded-xl object-cover border border-zinc-200"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{subject.title}</h1>
              <Link href="/subjects">
                <Button variant="secondary">Back</Button>
              </Link>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{subject.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowEditSubject((s) => !s)}>
            {showEditSubject ? "Close" : "Edit Subject"}
          </Button>
          <Button variant="danger" onClick={deleteSubject}>
            Delete Subject
          </Button>
        </div>
      </div>

      {showEditSubject ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <SubjectForm
            initialValues={subject}
            submitLabel="Save Subject"
            onSubmit={updateSubject}
            onCancel={() => setShowEditSubject(false)}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Tests</h2>
          <p className="mt-1 text-sm text-zinc-600">Manage tests under this subject.</p>
        </div>
        <Button onClick={() => setShowAddTest((s) => !s)}>
          {showAddTest ? "Close" : "Add Test"}
        </Button>
      </div>

      {showAddTest ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <TestForm submitLabel="Create Test" onSubmit={createTest} />
        </div>
      ) : null}

      {subject.tests?.length ? (
        <div className="grid grid-cols-1 gap-4">
          {subject.tests.map((t) => (
            <div key={t.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <img
                    src={t.thumbnail}
                    alt={t.title}
                    className="h-16 w-16 rounded-lg object-cover border border-zinc-200"
                  />
                  <div>
                    <div className="text-base font-semibold">{t.title}</div>
                    <div className="mt-1 text-sm text-zinc-600 line-clamp-2">
                      {t.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/tests/${t.id}`}>
                    <Button variant="secondary">Open</Button>
                  </Link>
                  <Button variant="danger" onClick={() => deleteTest(t.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
          No tests yet.
        </div>
      )}
    </div>
  );
}


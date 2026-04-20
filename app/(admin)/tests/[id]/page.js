"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TestForm from "@/components/forms/TestForm";
import QuestionForm from "@/components/forms/QuestionForm";

function typeColor(type) {
  if (type === "MCQ") return "purple";
  if (type === "YES_NO") return "blue";
  if (type === "SCALE") return "green";
  return "zinc";
}

export default function TestDetailPage() {
  const params = useParams();
  const testId = useMemo(() => Number(params?.id), [params]);

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditTest, setShowEditTest] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  async function load() {
    if (!Number.isFinite(testId)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tests/${testId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load test");
      setTest(data.test);
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [testId]);

  async function updateTest(values) {
    const res = await fetch(`/api/tests/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to update test");
    toast.success("Test updated");
    setShowEditTest(false);
    await load();
  }

  async function createQuestion(values) {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, ...values }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to create question");
    toast.success("Question created");
    setShowAddQuestion(false);
    await load();
  }

  async function updateQuestion(id, values) {
    const res = await fetch(`/api/questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to update question");
    toast.success("Question updated");
    setEditingQuestionId(null);
    await load();
  }

  async function deleteQuestion(id) {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to delete question");
    toast.success("Question deleted");
    await load();
  }

  if (loading) return <div className="text-sm text-zinc-600">Loading...</div>;
  if (!test) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-zinc-600">Test not found.</div>
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
            src={test.thumbnail}
            alt={test.title}
            className="h-20 w-20 rounded-xl object-cover border border-zinc-200"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{test.title}</h1>
              <Link href={`/subjects/${test.subjectId}`}>
                <Button variant="secondary">Back</Button>
              </Link>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{test.description}</p>
            {test.subject ? (
              <div className="mt-2 text-xs text-zinc-500">
                Subject: <span className="font-medium">{test.subject.title}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowEditTest((s) => !s)}>
            {showEditTest ? "Close" : "Edit Test"}
          </Button>
        </div>
      </div>

      {showEditTest ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <TestForm
            initialValues={test}
            submitLabel="Save Test"
            onSubmit={updateTest}
            onCancel={() => setShowEditTest(false)}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Questions</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Add questions with flexible options.
          </p>
        </div>
        <Button onClick={() => setShowAddQuestion((s) => !s)}>
          {showAddQuestion ? "Close" : "Add Question"}
        </Button>
      </div>

      {showAddQuestion ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <QuestionForm submitLabel="Create Question" onSubmit={createQuestion} />
        </div>
      ) : null}

      {test.questions?.length ? (
        <div className="space-y-4">
          {test.questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge color={typeColor(q.type)}>{q.type}</Badge>
                    <div className="text-sm font-semibold">Q{q.id}</div>
                  </div>
                  <div className="text-sm text-zinc-900 whitespace-pre-wrap">
                    {q.questionText}
                  </div>
                  {q.image ? (
                    <img
                      src={q.image}
                      alt="Question"
                      className="h-40 w-auto rounded-lg border border-zinc-200 object-cover"
                    />
                  ) : null}
                  <div className="space-y-1">
                    {q.options?.map((o) => (
                      <div
                        key={o.id}
                        className={[
                          "rounded-lg border px-3 py-2 text-sm",
                          o.isCorrect
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-zinc-200 bg-white text-zinc-800",
                        ].join(" ")}
                      >
                        {o.text}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setEditingQuestionId((cur) => (cur === q.id ? null : q.id))
                    }
                  >
                    {editingQuestionId === q.id ? "Close" : "Edit"}
                  </Button>
                  <Button variant="danger" onClick={() => deleteQuestion(q.id)}>
                    Delete
                  </Button>
                </div>
              </div>

              {editingQuestionId === q.id ? (
                <div className="mt-5 border-t border-zinc-200 pt-5">
                  <QuestionForm
                    initialValues={q}
                    submitLabel="Save Question"
                    onSubmit={(values) => updateQuestion(q.id, values)}
                    onCancel={() => setEditingQuestionId(null)}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
          No questions yet.
        </div>
      )}
    </div>
  );
}


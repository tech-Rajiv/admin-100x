"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import UploadField from "@/components/UploadField";

function defaultOptionsForType(type) {
  if (type === "YES_NO") {
    return [
      { text: "Yes", isCorrect: true },
      { text: "No", isCorrect: false },
    ];
  }
  if (type === "SCALE") {
    return [
      { text: "1", isCorrect: true },
      { text: "2", isCorrect: false },
      { text: "3", isCorrect: false },
      { text: "4", isCorrect: false },
      { text: "5", isCorrect: false },
    ];
  }
  return [
    { text: "Option 1", isCorrect: true },
    { text: "Option 2", isCorrect: false },
  ];
}

export default function QuestionForm({
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}) {
  const initialType = initialValues?.type || "MCQ";

  const [questionText, setQuestionText] = useState(initialValues?.questionText || "");
  const [image, setImage] = useState(initialValues?.image || "");
  const [type, setType] = useState(initialType);
  const [options, setOptions] = useState(() => {
    const fromInitial = Array.isArray(initialValues?.options)
      ? initialValues.options.map((o) => ({ text: o.text || "", isCorrect: !!o.isCorrect }))
      : null;
    return fromInitial && fromInitial.length >= 2 ? fromInitial : defaultOptionsForType(initialType);
  });
  const [loading, setLoading] = useState(false);

  const typeHelp = useMemo(() => {
    if (type === "YES_NO") return "Use Yes/No options and mark the correct one.";
    if (type === "SCALE") return "Use numeric scale options and mark the correct one.";
    return "Use multiple options and mark at least one correct answer.";
  }, [type]);

  function setOptionText(idx, text) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text } : o)));
  }

  function toggleCorrect(idx) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, isCorrect: !o.isCorrect } : o))
    );
  }

  function addOption() {
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  }

  function removeOption(idx) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function onTypeChange(nextType) {
    setType(nextType);
    setOptions(defaultOptionsForType(nextType));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleaned = options
      .map((o) => ({ text: String(o.text || "").trim(), isCorrect: !!o.isCorrect }))
      .filter((o) => o.text);

    if (cleaned.length < 2) return toast.error("Add at least 2 options");
    if (!cleaned.some((o) => o.isCorrect)) return toast.error("Mark at least one correct option");

    setLoading(true);
    try {
      await onSubmit({
        questionText,
        image: image || null,
        type,
        options: cleaned,
      });
      setLoading(false);
    } catch (e2) {
      setLoading(false);
      throw e2;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        rows={3}
        required
      />
      <UploadField label="Image (optional)" value={image} onChange={setImage} />
      <div className="grid grid-cols-1 gap-2">
        <Select label="Type" value={type} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="MCQ">MCQ</option>
          <option value="YES_NO">YES_NO</option>
          <option value="SCALE">SCALE</option>
        </Select>
        <div className="text-xs text-zinc-600">{typeHelp}</div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-zinc-700">Options</div>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!opt.isCorrect}
                onChange={() => toggleCorrect(idx)}
                className="h-4 w-4"
                title="Mark as correct"
              />
              <Input
                aria-label={`Option ${idx + 1}`}
                value={opt.text}
                onChange={(e) => setOptionText(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeOption(idx)}
                disabled={options.length <= 2}
                title={options.length <= 2 ? "Need at least 2 options" : "Remove option"}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={addOption}>
          Add option
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}


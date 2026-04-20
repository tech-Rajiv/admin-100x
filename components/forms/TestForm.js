"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import UploadField from "@/components/UploadField";

export default function TestForm({
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [thumbnail, setThumbnail] = useState(initialValues?.thumbnail || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, description, thumbnail });
      setLoading(false);
    } catch (e2) {
      setLoading(false);
      throw e2;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        required
      />
      <UploadField label="Thumbnail" value={thumbnail} onChange={setThumbnail} />
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


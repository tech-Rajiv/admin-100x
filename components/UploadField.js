"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { uploadToCloudinaryUnsigned } from "@/lib/upload";

export default function UploadField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinaryUnsigned(file);
      onChange(uploaded.url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label ? (
        <div className="text-sm font-medium text-zinc-700">{label}</div>
      ) : null}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          disabled={uploading}
          className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200"
        />
        {value ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange("")}
            disabled={uploading}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {uploading ? <div className="text-xs text-zinc-600">Uploading...</div> : null}

      {value ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-2">
          <img
            src={value}
            alt="Uploaded preview"
            className="h-28 w-auto rounded-md object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}


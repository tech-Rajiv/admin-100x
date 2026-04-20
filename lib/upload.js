"use client";

let cachedConfig = null;

async function getConfig() {
  if (cachedConfig) return cachedConfig;
  const res = await fetch("/api/cloudinary/config");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to load upload config");
  cachedConfig = data;
  return data;
}

export async function uploadToCloudinaryUnsigned(file) {
  if (!file) throw new Error("No file selected");

  const { cloudName, presetName } = await getConfig();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", presetName);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || "Upload failed");
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}


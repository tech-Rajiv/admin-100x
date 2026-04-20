function parseCloudNameFromUrl(cloudinaryUrl) {
  // Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  if (!cloudinaryUrl) return null;
  const at = cloudinaryUrl.lastIndexOf("@");
  if (at === -1) return null;
  return cloudinaryUrl.slice(at + 1).trim() || null;
}

export function getCloudinaryConfig() {
  const cloudName = parseCloudNameFromUrl(process.env.CLOUDINARY_URL);
  const presetName = process.env.CLOUDINARY_PRESET_NAME || null;
  if (!cloudName) throw new Error("Missing/invalid CLOUDINARY_URL");
  if (!presetName) throw new Error("Missing CLOUDINARY_PRESET_NAME");
  return { cloudName, presetName };
}


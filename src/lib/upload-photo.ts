export async function uploadProfilePhoto(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, "photo.jpg");

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error("Upload server error — try again"); }

  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

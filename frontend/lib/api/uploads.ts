import { fetchApi } from "./common";

export interface FileUploadRead {
  id: string;
  file_name: string;
  uploaded_by_id?: string | null;
  upload_date: string;
}

export interface FileUploadRenameRequest {
  file_name: string;
}

/**
 * Get the list of uploads
 * @returns The list of uploads
 */
export async function getUploads(): Promise<FileUploadRead[]> {
  return fetchApi<FileUploadRead[]>(`/admin/uploads`, {
    method: "GET",
    credentials: "include",
  });
}

export async function uploadFile(file: File): Promise<FileUploadRead> {
  const formData = new FormData();
  formData.append("file", file);
  return fetchApi<FileUploadRead>(`/admin/uploads`, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Do not set Content-Type header; browser will set it for FormData
  });
}

export async function renameUpload(
  id: string,
  data: FileUploadRenameRequest
): Promise<FileUploadRead> {
  return fetchApi<FileUploadRead>(`/admin/uploads/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteUpload(id: string): Promise<void> {
  return fetchApi<void>(`/admin/uploads/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}
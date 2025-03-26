import { mediaApi } from "@/config/api";

export interface UploadFileResponse {
  fileId: string;
}

export const uploadFileMutation = () => ({
  mutationFn: ({
    file,
    fileTypeId,
    userId,
    productId,
  }: {
    file: File;
    fileTypeId: string;
    userId: string;
    productId?: string;
  }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileTypeId", fileTypeId);
    formData.append("userId", userId);
    formData.append("fileName", file.name);
    formData.append("displayName", file.name);
    formData.append("imageOrder", "1");
    formData.append("isActive", "true");
    if (productId) {
      formData.append("productId", productId);
    }
    return mediaApi.uploadFile(formData) as Promise<UploadFileResponse>;
  },
});

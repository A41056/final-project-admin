import {
  fetchFormDataWithAuth,
  deleteWithAuth,
  MEDIA_API_URL,
  fetchWithAuth,
} from "@/config/api"; // Import trực tiếp các hàm fetch
import { useQuery, useMutation } from "react-query";

export interface UploadFileResponse {
  fileId: string;
  storageLocation: string;
}

export interface FileType {
  id: string;
  name?: string;
  identifier: string;
  defaultStorageLocation?: string;
  fileExtensions?: string;
  fileNamePattern?: string;
  maxSize: number;
}

// Mutation để upload file
export const useUploadFileMutation = () => {
  return useMutation<
    UploadFileResponse,
    Error,
    {
      file: File;
      fileTypeId: string;
      userId: string;
      productId?: string;
    }
  >({
    mutationFn: ({ file, fileTypeId, userId, productId }) => {
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
      return fetchFormDataWithAuth(`${MEDIA_API_URL}/files`, formData); // Gọi trực tiếp hàm fetch
    },
  });
};

// Mutation để delete file
export const useDeleteFileMutation = () => {
  return useMutation<void, Error, string>({
    mutationFn: (fileName: string) =>
      deleteWithAuth(`${MEDIA_API_URL}/files/${fileName}`), // Gọi trực tiếp hàm fetch
    onSuccess: () => {
      console.log("File deleted successfully");
    },
    onError: (error: any) => {
      console.error("Failed to delete file:", error);
    },
  });
};

// Hook để lấy tất cả file types
export const useGetAllFileTypes = () => {
  return useQuery<FileType[], Error>({
    queryKey: ["fileTypes"],
    queryFn: () => fetchWithAuth(`${MEDIA_API_URL}/filetypes`),
  });
};

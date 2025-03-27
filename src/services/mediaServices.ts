import { mediaApi } from "@/config/api";
import { useQuery } from "react-query";

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

export const getAllFileTypes = async (): Promise<FileType[]> => {
  return mediaApi.getFileTypes("/filetypes");
};

export const useGetAllFileTypes = () => {
  return useQuery<FileType[], Error>({
    queryKey: ["fileTypes"],
    queryFn: getAllFileTypes,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: (data) => {
      localStorage.setItem("fileTypes", JSON.stringify(data));
    },
    onError: (error) => {
      console.error("Failed to fetch file types:", error);
    },
  });
};

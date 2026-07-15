import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';
import axios from 'axios';

// 1. Get Presigned URL (no DB record created — just returns URL + fileKey)
export function usePresignUploadMutation() {
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const response = await apiClient.post('/documents/presign', null, {
        params: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      });
      return { file, ...response.data };
    }
  });
}

// 2. Upload to R2 directly
export function useUploadToR2Mutation() {
  return useMutation({
    mutationFn: async ({ url, file }: { url: string, file: File }) => {
      // Important: Use standard axios, not apiClient, to avoid sending our JWT to Cloudflare
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type
        }
      });
      return true;
    }
  });
}

// 3. Confirm Upload — verifies file in R2, saves to DB, queues for processing
export function useConfirmUploadMutation() {
  return useMutation({
    mutationFn: async (payload: { fileKey: string, fileName: string, fileType: string, fileSize: number }) => {
      const response = await apiClient.post('/documents/confirm', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Document uploaded and queued for processing!');
    }
  });
}

// Full Upload Flow Hook (Combines all 3 steps)
export function useDocumentUpload() {
  const presign = usePresignUploadMutation();
  const uploadToR2 = useUploadToR2Mutation();
  const confirm = useConfirmUploadMutation();

  const isUploading = presign.isPending || uploadToR2.isPending || confirm.isPending;

  const uploadFile = async (file: File) => {
    try {
      // 1. Get Presigned URL (no DB record yet)
      const { uploadUrl, fileKey } = await presign.mutateAsync({ file });

      // 2. Upload to R2
      await uploadToR2.mutateAsync({ url: uploadUrl, file });

      // 3. Confirm with backend (verifies R2, saves to DB, queues)
      const result = await confirm.mutateAsync({
        fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      return result.documentId;
    } catch (error: any) {
      toast.error('Failed to upload document');
      console.error(error);
      throw error;
    }
  };

  return { uploadFile, isUploading };
}

// 4. Poll Document Status
export function useDocumentStatus(documentId?: number) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await apiClient.get(`/documents/${documentId}/status`);
      return response.data;
    },
    enabled: !!documentId,
    // Poll every 2 seconds if not completed
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === 'COMPLETED' || status === 'FAILED') ? false : 2000;
    }
  });
}

// 5. Fetch all user documents
export function useUserDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await apiClient.get('/documents');
      return response.data;
    }
  });
}

// 6. Delete a document (removes from DB, embeddings, and R2)
export function useDeleteDocumentMutation() {
  return useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiClient.delete(`/documents/${documentId}`);
      return response.data;
    },
    onError: () => {
      toast.error('Failed to delete document');
    }
  });
}

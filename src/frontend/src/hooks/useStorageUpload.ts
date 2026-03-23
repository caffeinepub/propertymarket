import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useRef, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export interface UploadedMedia {
  mediaId: string; // format: "image:sha256:.." or "video:sha256:.."
  url?: string;
  name: string;
  type: "image" | "video";
}

export function useStorageUpload() {
  const { identity } = useInternetIdentity();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const storageClientRef = useRef<StorageClient | null>(null);

  const getStorageClient = useCallback(async () => {
    if (storageClientRef.current) return storageClientRef.current;
    const config = await loadConfig();
    const agent = new HttpAgent({
      host: config.backend_host,
      identity: identity ?? undefined,
    });
    if (config.backend_host?.includes("localhost")) {
      await agent.fetchRootKey().catch(() => {});
    }
    const client = new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
    storageClientRef.current = client;
    return client;
  }, [identity]);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedMedia[]> => {
      if (files.length === 0) return [];
      setUploading(true);
      setProgress(0);
      const results: UploadedMedia[] = [];
      try {
        const client = await getStorageClient();
        let completed = 0;
        await Promise.all(
          files.map(async (file) => {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const { hash } = await client.putFile(bytes, (pct) => {
              setProgress(
                Math.round(((completed + pct / 100) / files.length) * 100),
              );
            });
            const isVideo = file.type.startsWith("video/");
            const mediaType = isVideo ? "video" : "image";
            const mediaId = `${mediaType}:${hash}`;
            const url = await client.getDirectURL(hash);
            results.push({ mediaId, url, name: file.name, type: mediaType });
            completed++;
            setProgress(Math.round((completed / files.length) * 100));
          }),
        );
      } finally {
        setUploading(false);
      }
      return results;
    },
    [getStorageClient],
  );

  const getMediaUrl = useCallback(
    async (mediaId: string): Promise<string> => {
      // mediaId format: "image:sha256:..." or "video:sha256:..."
      const colonIdx = mediaId.indexOf(":");
      const hash = colonIdx >= 0 ? mediaId.substring(colonIdx + 1) : mediaId;
      const client = await getStorageClient();
      return client.getDirectURL(hash);
    },
    [getStorageClient],
  );

  return { uploadFiles, uploading, progress, getMediaUrl };
}

export function parseMediaId(mediaId: string): {
  type: "image" | "video";
  hash: string;
} {
  if (mediaId.startsWith("image:")) {
    return { type: "image", hash: mediaId.substring(6) };
  }
  if (mediaId.startsWith("video:")) {
    return { type: "video", hash: mediaId.substring(6) };
  }
  // Legacy: assume image
  return { type: "image", hash: mediaId };
}

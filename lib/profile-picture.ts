type BufferLike =
  | Buffer
  | Uint8Array
  | { type?: string; data?: number[] }
  | null
  | undefined;

interface ProfilePictureSource {
  profilePicture?:         string | null;
  profilePictureData?:     BufferLike;
  profilePictureMimeType?: string | null;
}

function toBuffer(data: BufferLike) {
  if (!data) return null;
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return Buffer.from(data);
  if (data.type === "Buffer" && Array.isArray(data.data)) return Buffer.from(data.data);
  return null;
}

export function profilePictureToDataUrl(source: ProfilePictureSource) {
  const buffer = toBuffer(source.profilePictureData);
  if (buffer && source.profilePictureMimeType) {
    return `data:${source.profilePictureMimeType};base64,${buffer.toString("base64")}`;
  }

  return source.profilePicture ?? null;
}

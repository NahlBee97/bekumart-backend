export const bufferToDataURI = (buffer: Buffer, mimeType: string) => {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
};

export const getPublicIdFromUrl = (url: string): string | null => {
  const urlParts = url.split("/");
  const uploadIndex = urlParts.indexOf("upload");
  if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
    return null;
  }
  const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
  const publicId = publicIdWithExtension.substring(
    0,
    publicIdWithExtension.lastIndexOf(".")
  );
  return publicId;
};

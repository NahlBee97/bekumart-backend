// Helper function to create a Data URI from a file buffer
export const bufferToDataURI = (buffer: Buffer, mimeType: string) => {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
};

// Helper function to extract public_id from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split("/");
    // Find the 'upload' part of the URL
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      return null;
    }
    // The public_id is the part after the version number
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    // Remove the file extension
    const publicId = publicIdWithExtension.substring(
      0,
      publicIdWithExtension.lastIndexOf(".")
    );
    return publicId;
  } catch (error) {
    console.error("Failed to extract public_id from URL:", url, error);
    return null;
  }
};
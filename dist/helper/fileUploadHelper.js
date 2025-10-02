"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicIdFromUrl = exports.bufferToDataURI = void 0;
// Helper function to create a Data URI from a file buffer
const bufferToDataURI = (buffer, mimeType) => {
    const base64 = buffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
};
exports.bufferToDataURI = bufferToDataURI;
// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
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
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf("."));
        return publicId;
    }
    catch (error) {
        console.error("Failed to extract public_id from URL:", url, error);
        return null;
    }
};
exports.getPublicIdFromUrl = getPublicIdFromUrl;
//# sourceMappingURL=fileUploadHelper.js.map
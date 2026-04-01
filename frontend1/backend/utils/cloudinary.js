import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // IMPORTANT: inside this file

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };




import fs from "fs";

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};

export const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;
    
    const urlParts = fileUrl.split('/');
    const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));
    
    if (versionIndex === -1) {
      console.error("Could not parse Cloudinary URL");
      return null;
    }
    
    const publicIdWithExtension = urlParts.slice(versionIndex + 1).join('/');
    const resourceType = fileUrl.includes('/raw/') ? 'raw' : (fileUrl.includes('/video/') ? 'video' : 'image');
    
    let publicId = publicIdWithExtension;
    if (resourceType !== 'raw') {
      const lastDotIndex = publicId.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        publicId = publicId.substring(0, lastDotIndex);
      }
    }
    
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};
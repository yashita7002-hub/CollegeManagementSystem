import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const uploadOnCloudinary = async (localFilePath) => {
   
    console.log("Uploading file:", localFilePath);
    try {
        if (!localFilePath) return null

        // ✅ WAIT for upload
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // ✅ log after upload
        console.log("File uploaded:", response.url)

        // ✅ delete local file
        fs.unlinkSync(localFilePath)

        return response

    } catch (error) {
        // ❗ prevent crash if file doesn't exist
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }

        console.log("Cloudinary error:", error)
        return null
    }
}

export { uploadOnCloudinary }
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function run() {
  fs.writeFileSync("test.txt", "hello world testing 123");
  try {
    const res = await cloudinary.uploader.upload("test.txt", { resource_type: "auto" });
    console.log("SUCCESS:", res.secure_url);
  } catch (e) {
    console.error("FAILED:", e);
  } finally {
    fs.unlinkSync("test.txt");
  }
}

run();

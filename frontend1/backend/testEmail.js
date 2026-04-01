import dotenv from "dotenv";
dotenv.config();
import { sendEmail } from "./utils/sendEmail.js";

sendEmail({
  to: "test@gmail.com",
  subject: "Test Email",
  text: "This is a test from Nodemailer",
})
  .then(() => console.log("Sent!"))
  .catch(err => console.error(err));
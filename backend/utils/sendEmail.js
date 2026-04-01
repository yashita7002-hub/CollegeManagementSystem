import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // you can change this
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password (NOT your real password)
      },
    });

    const mailOptions = {
      from: `"College Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);
    return info;

  } catch (error) {
    
    throw new ApiError(201, "Email could not be send!")
  }
};
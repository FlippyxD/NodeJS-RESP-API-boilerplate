import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTH_HOST,
        port: process.env.SMTH_PORT,
        auth: {
            user: process.env.SMTH_EMAIL,
            pass: process.env.SMTH_PASSWORD,
        },
    });

    // Send mail with defined transport object
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.text,
    };

    const info = await transporter.sendMail(message);

    console.log("Message sent: %s", info.messageId);
};

export default sendEmail;

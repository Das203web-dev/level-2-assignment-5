import nodemailer from "nodemailer"
import { envVariables } from "../config/env"
import AppError from "../errorHelpers/AppError";
import path from "path"
import ejs from "ejs"
const transporter = nodemailer.createTransport({
    secure: true,
    auth: {
        user: envVariables.EMAIL_SENDER.SMTP_USER_EMAIL,
        pass: envVariables.EMAIL_SENDER.SMTP_PASS
    },
    port: Number(envVariables.EMAIL_SENDER.SMTP_PORT),
    host: envVariables.EMAIL_SENDER.SMTP_HOST
})
interface IEmailOptions {
    emailTo: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        fileName: string,
        content: Buffer | string,
        contentType: string
    }[]
}
export const sendEmail = async ({ emailTo, subject, attachments, templateName, templateData }: IEmailOptions) => {
    try {
        const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData)
        const info = await transporter.sendMail({
            from: envVariables.EMAIL_SENDER.SMTP_USER_EMAIL,
            to: emailTo,
            subject: subject,
            attachments: attachments?.map(attachment => ({
                filename: attachment.fileName,
                content: attachment.content,
                contentType: attachment.contentType
            })),
            html: html
        })
    } catch (error: any) {
        console.error("Nodemailer failed to send email:", error); // Log the real error

        throw new AppError(500, `${error.message}`)
    }
}
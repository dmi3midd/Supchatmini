import nodemailer from "nodemailer";
import { config } from "../configs/env-config.js";
import { ApiError } from "../exceptions/ApiError.js";

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.EMAIL.HOST,
            port: config.EMAIL.PORT,
            secure: config.EMAIL.PORT === 465,
            auth: {
                user: config.EMAIL.USER,
                pass: config.EMAIL.PASSWORD,
            },
            pool: true,
            maxConnections: 5,
        });
    }

    public async checkConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            console.log("SMTP connection established successfully.");
        } catch (error) {
            console.error("SMTP Configuration Error:", error);
            throw new Error("Failed to connect to email server.");
        }
    }

    public async sendEmail(to: string, subject: string, text: string, html?: string): Promise<string> {
        try {
            const info = await this.transporter.sendMail({
                from: `<${config.EMAIL.USER}>`,
                to,
                subject,
                text,
                html: html || text,
            });

            return info.messageId;
        } catch (error: any) {
            console.error("Email sending failed:", error);
            throw ApiError.BadRequest(`Failed to send email: ${error.message}`);
        }
    }
}

export default new EmailService();
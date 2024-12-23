const nodemailer = require("nodemailer");

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `LifeQuests <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.DEV_EMAIL_HOST,
            port: process.env.DEV_EMAIL_PORT,
            auth: {
                user: process.env.DEV_EMAIL_USERNAME,
                pass: process.env.DEV_EMAIL_PASSWORD 
            },
            logger: true,
        });
    }

    generateWelcomeHTML() {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta name="viewport" content="width=device-width">
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <title>Welcome to LifeQuests</title>
                    <style>
                        .btn {
                            background-color: #55c57a;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <p>Hi ${this.firstName},</p>
                    <p>Welcome to LifeQuests, we're glad to have you 🎉🙏</p>
                    <p>We're all a big family here, so make sure to upload your user photo so we get to know you better!</p>
                    <p><a href="${this.url}" class="btn">Upload user photo</a></p>
                    <p>If you need any help, please don't hesitate to contact us!</p>
                    <p>- The LifeQuests Team</p>
                </body>
            </html>
        `;
    }

    generateWelcomeText() {
        return `
            Hi ${this.firstName},

            Welcome to LifeQuests, we're glad to have you! 🎉🙏

            We're all a big family here, so make sure to upload your user photo so we get to know you better!

            Upload your photo here: ${this.url}

            If you need any help, please don't hesitate to contact us!

            - The LifeQuests Team
        `.trim();
    }

    generatePasswordResetHTML() {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta name="viewport" content="width=device-width">
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                    <title>Password Reset</title>
                    <style>
                        .btn {
                            background-color: #55c57a;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <p>Hi ${this.firstName},</p>
                    <p>Forgot your password? Click the button below to reset it:</p>
                    <p><a href="${this.url}" class="btn">Reset your password</a></p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>- The LifeQuests Team</p>
                </body>
            </html>
        `;
    }

    generatePasswordResetText() {
        return `
            Hi ${this.firstName},

            Forgot your password? Use this link to reset it:
            ${this.url}

            If you didn't request this, please ignore this email.

            - The LifeQuests Team
        `.trim();
    }

    async send(htmlContent, textContent, subject) {
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html: htmlContent,
            text: textContent
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send(
            this.generateWelcomeHTML(),
            this.generateWelcomeText(),
            "Welcome to the LifeQuests family!"
        );
    }

    async sendPasswordReset() {
        await this.send(
            this.generatePasswordResetHTML(),
            this.generatePasswordResetText(),
            "Your password reset token (valid for 10 min)"
        );
    }
}
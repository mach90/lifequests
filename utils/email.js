const nodemailer = require("nodemailer");

module.exports = class Email {
    constructor(user, url) {
        // Set the recipient's email address
        this.to = user.email;
        // Extract the first part from the user's name
        this.firstName = user.name.split(" ")[0];
        // Set the URL to be included in the email
        this.url = url;
        // Set the sender's email address
        this.from = `LifeQuests <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        // Create a new transport instance using nodemailer
        return nodemailer.createTransport({
            // Set the email host from environment variables
            host: process.env.NODE_ENV === "production" ? process.env.PROD_EMAIL_HOST : process.env.DEV_EMAIL_HOST,
            // Set the email port from environment variables
            port: process.env.NODE_ENV === "production" ? process.env.PROD_EMAIL_PORT : process.env.DEV_EMAIL_PORT,
            // Set the authentication details from environment variables
            auth: {
                user: process.env.NODE_ENV === "production" ? process.env.PROD_EMAIL_USERNAME : process.env.DEV_EMAIL_USERNAME,
                pass: process.env.NODE_ENV === "production" ? process.env.PROD_EMAIL_PASSWORD : process.env.DEV_EMAIL_PASSWORD,
            },
            // Enable logging for the transport instance
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
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        p {
                            color: #333;
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #55c57a;
                            color: white;
                            padding: 12px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                            font-weight: bold;
                        }
                        .container {
                            max-width: 600px;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            margin: 0 auto;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p>Hello ${this.firstName},</p>
                        <p>Welcome to LifeQuests. Your account has been successfully created.</p>
                        <p>To personalize your experience, you can upload a profile avatar on your profile:</p>
                        <p><a href="${this.url}" class="btn">Upload your avatar</a></p>
                        <p>If you have any questions or need assistance, feel free to contact us.</p>
                        <p><strong>The LifeQuests Team</strong></p>
                    </div>
                </body>
            </html>
        `;
    }

    generateWelcomeText() {
        return `
            Hello ${this.firstName},  

            Welcome to LifeQuests. Your account has been successfully created.  

            To personalize your experience, you can upload a profile photo on your profile:  
            ${this.url}  

            If you have any questions or need assistance, feel free to contact us.

            The LifeQuests Team
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
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 20px;
                        }
                        p {
                            color: #333;
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #55c57a;
                            color: white;
                            padding: 12px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                            font-weight: bold;
                        }
                        .container {
                            max-width: 600px;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            margin: 0 auto;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p>Hello ${this.firstName},</p>
                        <p>We received a request to reset your password for your LifeQuests account. If you made this request, please click the link below to set a new password:</p>
                        <p><a href="${this.url}" class="btn">Reset your password</a></p>
                        <p>If you did not request a password reset, you can safely ignore this email. Your account remains secure.</p>
                        <p><strong>The LifeQuests Team</strong></p>
                    </div>
                </body>
            </html>
        `;
    }

    generatePasswordResetText() {
        return `
            Hello ${this.firstName},

            We received a request to reset your password for your LifeQuests account. If you made this request, please click the link below to set a new password:

            ${this.url}

            If you did not request a password reset, you can safely ignore this email. Your account remains secure.

            The LifeQuests Team
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
            "Welcome to LifeQuests - Your account has been created"
        );
    }

    async sendPasswordReset() {
        await this.send(
            this.generatePasswordResetHTML(),
            this.generatePasswordResetText(),
            "LifeQuests password reset request (valid for 10 minutes)"
        );
    }
}
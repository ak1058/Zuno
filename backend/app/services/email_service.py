# app/services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from jinja2 import Template

class EmailService:
    @staticmethod
    def send_verification_email(to_email: str, verification_link: str, user_name: str):
        # Email content
        subject = "Verify Your Email - Zuno Task Management"
        
        # HTML template for email
        html_template = """
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Welcome to Zuno Task Management!</h2>
                <p>Hello {{ user_name }},</p>
                <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ verification_link }}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #666;">{{ verification_link }}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <br>
                <p>Best regards,<br>The Zuno Team</p>
            </div>
        </body>
        </html>
        """
        
        # Render template
        template = Template(html_template)
        html_content = template.render(
            user_name=user_name,
            verification_link=verification_link
        )
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.FROM_EMAIL
        msg['To'] = to_email
        
        # Attach HTML
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
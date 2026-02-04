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
    
    @staticmethod
    def send_invitation_email(
        to_email: str, 
        workspace_name: str, 
        inviter_name: str,
        invite_link: str,
        role: str,
        token: str
    ):
        """Send workspace invitation email"""
        subject = f"Invitation to join {workspace_name} on Zuno"
        
        # HTML template for invitation email
        html_template = """
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4CAF50; margin: 0;">Zuno</h1>
                    <p style="color: #666; margin: 5px 0;">Task Management Platform</p>
                </div>
                
                <h2 style="color: #333;">Workspace Invitation</h2>
                <p>Hello,</p>
                <p><strong>{{ inviter_name }}</strong> has invited you to join the workspace 
                <strong>"{{ workspace_name }}"</strong> on Zuno Task Management.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
                    <p><strong>Workspace:</strong> {{ workspace_name }}</p>
                    <p><strong>Role:</strong> <span style="background-color: #e8f5e9; padding: 4px 8px; border-radius: 4px;">{{ role }}</span></p>
                    <p><strong>Invited by:</strong> {{ inviter_name }}</p>
                    <p><strong>Invitation ID:</strong> <code style="background-color: #f1f1f1; padding: 2px 6px; border-radius: 3px; font-size: 12px;">{{ token_short }}</code></p>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="{{ invite_link }}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Accept Invitation
                    </a>
                </div>
                
                <p style="text-align: center; color: #666; font-size: 14px;">
                    Or copy and paste this link in your browser:
                </p>
                <p style="word-break: break-all; color: #666; background-color: #f9f9f9; padding: 12px; border-radius: 4px; font-size: 13px; text-align: center;">
                    {{ invite_link }}
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #777; font-size: 14px;">
                        <strong>Important:</strong><br>
                        • This invitation will expire in 7 days<br>
                        • If you don't have a Zuno account, you'll be prompted to create one<br>
                        • You'll get your own personal workspace along with access to this workspace
                    </p>
                </div>
                
                <br>
                <p>Best regards,<br>The Zuno Team</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
                    <p>© 2024 Zuno Task Management. All rights reserved.</p>
                    <p>If you received this email by mistake, please ignore it.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Render template
        template = Template(html_template)
        html_content = template.render(
            workspace_name=workspace_name,
            inviter_name=inviter_name,
            invite_link=invite_link,
            role=role.capitalize(),
            token_short=token[:8] + "..."  # Show only first 8 chars of token
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
            print(f"Error sending invitation email: {e}")
            return False
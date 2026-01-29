import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"DCET Coaching - Rank 48" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - DCET Coaching",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">DCET Coaching</h1>
            <p style="color: #6b7280; margin: 5px 0;">Rank 48 | Excellence in Education</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
            <h2 style="margin: 0 0 10px 0;">Email Verification</h2>
            <p style="margin: 0 0 20px 0; opacity: 0.9;">Your OTP code is:</p>
            <div style="background: rgba(255,255,255,0.2); padding: 15px 30px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.8;">This code expires in 10 minutes</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>If you didn't request this code, please ignore this email.</p>
            <p style="margin-top: 20px;">
              <strong>Mohammed Adnan</strong><br/>
              Founder, DCET Coaching<br/>
              DCET Rank: 48 | RVCE CSE
            </p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

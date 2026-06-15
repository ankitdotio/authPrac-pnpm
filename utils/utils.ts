export function generateOtp(){
    return Math.floor(100000 + Math.random() *900000).toString()
}

export function getOtpHtml(otp: string | number) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>OTP Verification</title>
    </head>
    <body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            
            <table width="500" cellpadding="0" cellspacing="0" 
              style="background:#ffffff; border-radius:10px; padding:40px;">
              
              <tr>
                <td align="center">
                  <h1 style="margin:0; color:#222;">Verify Your Email</h1>
                </td>
              </tr>

              <tr>
                <td style="padding-top:20px; color:#555; font-size:16px; line-height:1.6;">
                  Use the OTP below to complete your verification process.
                  This OTP is valid for a limited time.
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:30px 0;">
                  <div
                    style="
                      display:inline-block;
                      background:#000;
                      color:#fff;
                      padding:15px 30px;
                      font-size:32px;
                      font-weight:bold;
                      letter-spacing:8px;
                      border-radius:8px;
                    "
                  >
                    ${otp}
                  </div>
                </td>
              </tr>

              <tr>
                <td style="color:#777; font-size:14px; line-height:1.6;">
                  If you did not request this OTP, you can safely ignore this email.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}
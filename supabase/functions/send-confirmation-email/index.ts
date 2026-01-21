// Supabase Edge Function to send confirmation emails
// Deploy this using: supabase functions deploy send-confirmation-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { buyerEmail, buyerName, squares, eventName } = await req.json()

    if (!buyerEmail || !buyerName || !squares) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send email using Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'AADS Fundraiser <noreply@yourdomain.com>',
        to: [buyerEmail],
        subject: '✅ Payment Confirmed - Your Squares Are Secured!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f39200; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎉 Payment Confirmed!</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #2d2d2d;">Hi ${buyerName},</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Great news! Your e-transfer has been received and confirmed by our admin.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f39200;">
                <h3 style="margin-top: 0; color: #f39200;">Your Square Numbers:</h3>
                <p style="font-size: 24px; font-weight: bold; color: #2d2d2d;">${squares}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Your squares have been officially marked as <strong>SOLD</strong> and you're now entered into the draw!
              </p>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>📅 What's Next:</strong><br>
                  ${eventName ? eventName + ' - ' : ''}The winner will be announced soon. Good luck!
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Questions? Contact us at any time.
              </p>
            </div>
            
            <div style="background: #2d2d2d; padding: 15px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Atlantic Amateur Darts Series (AADS)
              </p>
            </div>
          </div>
        `
      })
    })

    const data = await res.json()

    if (res.ok) {
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

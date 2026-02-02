// Supabase Edge Function to send confirmation emails
// Deploy this using: supabase functions deploy send-confirmation-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { buyerEmail, buyerName, squares, eventName, squareCount, organizerName, boardId } = await req.json()

    console.log('Received email request:', { buyerEmail, buyerName, squares, eventName, squareCount })

    if (!buyerEmail || !buyerName || !squares || !eventName) {
      console.error('Missing required fields:', { buyerEmail, buyerName, squares, eventName })
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set!')
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending email via Resend API...')

    // Send email using Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'SquareFund <noreply@aadsdarts.com>',
        to: [buyerEmail],
        subject: '✅ Payment Confirmed - Your Squares Are Locked In!',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #121212;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
    }
    table {
      border-spacing: 0;
      width: 100%;
    }
    td {
      padding: 0;
    }
    img {
      border: 0;
    }
    
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #1a1a1a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 40px;
      overflow: hidden;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    
    .header {
      padding: 40px;
      text-align: center;
      background-color: #000000;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .content {
      padding: 40px;
    }
    
    .brand-text {
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
      font-style: italic;
      letter-spacing: -1px;
      color: #ffffff;
    }
    .accent {
      color: #f97316;
    }
    .success-accent {
      color: #22c55e;
    }
    .title {
      font-size: 32px;
      font-weight: 900;
      text-transform: uppercase;
      font-style: italic;
      letter-spacing: -1.5px;
      line-height: 1;
      margin: 0 0 20px 0;
    }
    .label {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .body-text {
      font-size: 16px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 30px;
    }
    
    .details-box {
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 25px;
      margin-bottom: 30px;
    }
    .detail-row {
      margin-bottom: 15px;
    }
    .detail-label {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      color: #64748b;
      display: block;
    }
    .detail-value {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }

    .status-badge {
      display: inline-block;
      background-color: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #22c55e;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .footer {
      padding: 30px;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #475569;
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <img src="https://raw.githubusercontent.com/dowdarts/squaresfundraiser/main/new-logo.png" alt="SquareFund" style="max-width: 180px; margin-bottom: 15px;">
            <br>
            <span class="brand-text">SQUARE<span class="accent">FUND</span></span>
          </div>
          
          <div class="content">
            <div class="status-badge">Payment Confirmed & Locked</div>
            <h1 class="title">YOUR SQUARES ARE <span class="success-accent">LOCKED IN</span></h1>
            
            <p class="body-text">
              Great news, <strong>${buyerName}</strong>!<br><br>
              The organizer for <strong>${eventName}</strong> has confirmed your payment. Your squares are officially locked in and ready for the big draw.
            </p>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value success-accent">Confirmed & Paid</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Confirmed Squares</span>
                <span class="detail-value">${squareCount || ''} Square${squareCount > 1 ? 's' : ''} (${squares})</span>
              </div>
              <div class="detail-row" style="margin-bottom: 0;">
                <span class="detail-label">Fundraiser</span>
                <span class="detail-value">${eventName}</span>
              </div>
            </div>

            <div class="label">Winning Details</div>
            <p class="body-text" style="font-size: 14px;">
              Thank you for supporting our fundraiser! The winner will be determined once all squares on the board have been sold and confirmed. 
            </p>

            <p class="body-text" style="font-size: 14px;">
              Please check with the organizer${organizerName ? ' (<strong>' + organizerName + '</strong>)' : ''} for more details regarding the drawing date and results.
            </p>

            ${boardId ? `
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://dowdarts.github.io/squaresfundraiser/squares.html?id=${boardId}" style="background-color: #ffffff; color: #121212; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">View Live Board</a>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            SQUARE<span class="accent">FUND</span> &bull; OFFICIAL CONFIRMATION &bull; GOOD LUCK!
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
        `
      })
    })

    const data = await res.json()

    console.log('Resend API response status:', res.status)
    console.log('Resend API response:', data)

    if (res.ok) {
      console.log('✅ Email sent successfully!')
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('❌ Resend API error:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Exception in email function:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

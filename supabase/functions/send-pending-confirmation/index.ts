// Supabase Edge Function to send pending confirmation to buyer
// Deploy this using: supabase functions deploy send-pending-confirmation

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
    const { buyerEmail, buyerName, fundraiserName, squareNumbers, squareCount, totalAmount, organizerEmail } = await req.json()

    console.log('Received pending confirmation request:', { buyerEmail, buyerName, fundraiserName, squareNumbers, squareCount, totalAmount })

    if (!buyerEmail || !buyerName || !fundraiserName || !squareNumbers || !totalAmount) {
      console.error('Missing required fields')
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

    console.log('Sending pending confirmation via Resend API...')

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
        subject: '⏳ Squares Reserved - Payment Pending Verification',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Squares Reserved</title>
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
      background-color: rgba(249, 115, 22, 0.1);
      border: 1px solid rgba(249, 115, 22, 0.2);
      color: #f97316;
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
            <img src="https://i.postimg.cc/kVmmndJP/Untitled-2.png" alt="SquareFund" style="max-width: 180px; margin-bottom: 15px;">
            <br>
            <span class="brand-text">SQUARE<span class="accent">FUND</span></span>
          </div>
          
          <div class="content">
            <div class="status-badge">Payment Pending Verification</div>
            <h1 class="title">YOUR SQUARES ARE <span class="accent">RESERVED</span></h1>
            
            <p class="body-text">
              Thanks for your support, <strong>${buyerName}</strong>!<br><br>
              We've received your request for <strong>${fundraiserName}</strong>. Your chosen squares are currently reserved. 
              The organizer has been notified to verify your payment.
            </p>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Reserved For</span>
                <span class="detail-value">${buyerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Your Squares</span>
                <span class="detail-value">${squareCount} Square${squareCount > 1 ? 's' : ''} (${squareNumbers})</span>
              </div>
              <div class="detail-row" style="margin-bottom: 0;">
                <span class="detail-label">Total Amount</span>
                <span class="detail-value accent">$${totalAmount}</span>
              </div>
            </div>

            <div class="label">What Happens Next?</div>
            <p class="body-text" style="font-size: 14px;">
              Once the organizer confirms your Interac e-Transfer, your squares will be officially locked in on the board. 
              <strong>You will receive a follow-up email</strong> as soon as the confirmation is complete.
            </p>

            ${organizerEmail ? `
            <p class="body-text" style="font-size: 12px; color: #64748b;">
              If you haven't sent your e-Transfer yet, please send it to:<br>
              <strong style="color: #ffffff;">${organizerEmail}</strong>
            </p>
            ` : ''}
          </div>
          
          <div class="footer">
            SQUARE<span class="accent">FUND</span> &bull; NO PAPER GRIDS &bull; NO HASSLE
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
      console.log('✅ Pending confirmation sent successfully!')
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
    console.error('❌ Exception in pending confirmation function:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

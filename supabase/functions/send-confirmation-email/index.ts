// Supabase Edge Function - Enhanced Email Workflow
// Deploy this using: supabase functions deploy send-confirmation-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const LOGO_URL = "https://i.postimg.cc/kVmmndJP/Untitled-2.png"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Edge Function invoked:', new Date().toISOString())
  console.log('📨 Request method:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight - returning OK')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('📦 Request body received:', JSON.stringify(requestBody, null, 2))
    
    const { buyerEmail, buyerName, squares, fundraiserId, emailType } = requestBody
    console.log(`📧 Email details - Type: ${emailType}, Buyer: ${buyerName}, Email: ${buyerEmail}, Squares: ${squares}, FundraiserId: ${fundraiserId}`)

    if (!buyerEmail || !buyerName || !squares || !fundraiserId || !emailType) {
      console.error('❌ Missing required fields:', { buyerEmail, buyerName, squares, fundraiserId, emailType })
      return new Response(
        JSON.stringify({ error: 'Missing required fields (need: buyerEmail, buyerName, squares, fundraiserId, emailType)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate emailType
    if (!['pending', 'admin-notification', 'approved'].includes(emailType)) {
      console.error('❌ Invalid emailType:', emailType)
      return new Response(
        JSON.stringify({ error: 'Invalid emailType. Must be: pending, admin-notification, or approved' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client to fetch organizer info
    console.log('🔗 Creating Supabase client...')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    console.log('🌐 Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Fetch fundraiser and organizer profile
    console.log('🔍 Fetching fundraiser data for ID:', fundraiserId)
    const { data: fundraiser, error: fundraiserError } = await supabaseClient
      .from('fundraisers')
      .select(`
        title,
        profiles!fundraisers_organizer_id_fkey (
          organization_name,
          etransfer_email
        )
      `)
      .eq('id', fundraiserId)
      .single()

    if (fundraiserError || !fundraiser) {
      console.error('❌ Fundraiser fetch error:', fundraiserError)
      return new Response(
        JSON.stringify({ error: 'Fundraiser not found', details: fundraiserError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('✅ Fundraiser data retrieved:', { title: fundraiser.title, organization: fundraiser.profiles?.organization_name })

    const organizationName = fundraiser.profiles?.organization_name || 'Fundraiser Organizer'
    const fundraiserTitle = fundraiser.title || 'Fundraiser'
    const etransferEmail = fundraiser.profiles?.etransfer_email || 'payments@example.com'
    
    console.log('📋 Email metadata:', { organizationName, fundraiserTitle, etransferEmail })

    let emailSubject = ''
    let emailHtml = ''

    // Email Type A: Pending Reservation (User Confirmation)
    if (emailType === 'pending') {
      console.log('📝 Composing PENDING email...')
      emailSubject = 'Action Required: Your SquareFund Reservation'
      emailHtml = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <img src="${LOGO_URL}" alt="${organizationName}" style="max-width: 180px;">
            </div>
            <div style="padding: 40px; color: #334155; line-height: 1.6;">
              <h2 style="color: #1a2b4b; margin-top: 0;">Squares Reserved!</h2>
              <p>Hi <strong>${buyerName}</strong>,</p>
              <p>Your spots in <strong>${fundraiserTitle}</strong> are being held! We've reserved the following squares for you:</p>
              <div style="background: #fff8f0; border: 1px dashed #f7941d; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
                <span style="font-size: 24px; font-weight: 800; color: #f7941d; letter-spacing: 2px;">#${squares}</span>
              </div>
              <p><strong>Next Step: Payment Verification</strong></p>
              <p>To finalize your purchase, please ensure your e-Transfer has been sent to <strong>${etransferEmail}</strong>.</p>
              <p>Once ${organizationName} verifies the transfer, you will receive a <strong>final confirmation email</strong>.</p>
              <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Questions? Contact ${organizationName}.</p>
            </div>
          </div>
        </div>
      `
    } 
    // Email Type C: Admin Notification (New Purchase Pending)
    else if (emailType === 'admin-notification') {
      console.log('📝 Composing ADMIN NOTIFICATION email...')
      const adminEmail = fundraiser.profiles?.etransfer_email || 'admin@example.com'
      emailSubject = '🔔 New Purchase Pending Approval - SquareFund'
      emailHtml = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <img src="${LOGO_URL}" alt="Square Fund" style="max-width: 180px;">
            </div>
            <div style="background-color: #f59e0b; padding: 20px; text-align: center; color: white; font-weight: bold;">
              🔔 New Purchase Requires Your Approval
            </div>
            <div style="padding: 40px; color: #334155; line-height: 1.6;">
              <h2 style="color: #1a2b4b; margin-top: 0;">Purchase Details</h2>
              <p><strong>Buyer:</strong> ${buyerName}</p>
              <p><strong>Email:</strong> ${buyerEmail}</p>
              <p><strong>Fundraiser:</strong> ${fundraiserTitle}</p>
              <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">SQUARES RESERVED</p>
                <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: 900; color: #1a2b4b;">#${squares}</p>
              </div>
              <p><strong>Next Steps:</strong></p>
              <ol style="color: #374151;">
                <li>Verify e-Transfer has been received at <strong>${etransferEmail}</strong></li>
                <li>Log in to your admin dashboard</li>
                <li>Approve the payment to finalize the purchase</li>
              </ol>
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="display: inline-block; padding: 15px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Review & Approve
                </a>
              </div>
              <p style="font-size: 14px; color: #64748b; margin-top: 30px;">This notification was sent because someone purchased squares in your fundraiser.</p>
            </div>
          </div>
        </div>
      `
    } 
    // Email Type B: Approved (Final Confirmation)
    else {
      console.log('📝 Composing APPROVED email...')
      emailSubject = '✅ Confirmed: Your Squares are Secured!'
      emailHtml = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <img src="${LOGO_URL}" alt="${organizationName}" style="max-width: 180px;">
            </div>
            <div style="background-color: #2e8b57; padding: 20px; text-align: center; color: white; font-weight: bold;">
              Success! Your payment is confirmed.
            </div>
            <div style="padding: 40px; text-align: center; color: #334155;">
              <p>Hi <strong>${buyerName}</strong>, your payment has been verified for <strong>${fundraiserTitle}</strong>!</p>
              <div style="background-color: #f0fdf4; border: 2px solid #2e8b57; padding: 30px; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 0; color: #2e8b57; font-weight: bold;">ACTIVE NUMBERS</p>
                <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: 900; color: #1a2b4b;">#${squares}</p>
              </div>
              <p>Stay tuned! ${organizationName} will notify you once the live draw begins. <strong>Good luck on your numbers!</strong></p>
              <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Questions? Contact ${organizationName}.</p>
            </div>
            <div style="background: #2d2d2d; padding: 15px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                ${organizationName} Fundraiser
              </p>
            </div>
          </div>
        </div>
      `
    }

    // Send email using Resend API
    console.log('📮 Preparing to send email via Resend API...')
    const finalRecipient = emailType === 'admin-notification' ? (fundraiser.profiles?.etransfer_email || 'admin@example.com') : buyerEmail
    console.log('📧 Email payload:', {
      from: `Square Fund <noreply@aadsdarts.com>`,
      to: finalRecipient,
      subject: emailSubject,
      htmlLength: emailHtml.length
    })
    console.log('🔑 Resend API key configured:', RESEND_API_KEY ? 'YES (key present)' : 'NO (MISSING!)')
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `Square Fund <noreply@aadsdarts.com>`,
        to: [finalRecipient],
        subject: emailSubject,
        html: emailHtml
      })
    })

    console.log('📬 Resend API response status:', res.status)
    const data = await res.json()
    console.log('📦 Resend API response data:', JSON.stringify(data, null, 2))

    if (res.ok) {
      console.log('✅ Email sent successfully! Email ID:', data.id)
      return new Response(
        JSON.stringify({ success: true, data, emailType }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('❌ Resend API error:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error: any) {
    console.error('💥 Edge Function error:', error)
    console.error('🔍 Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: String(error), stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

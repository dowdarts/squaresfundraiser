// Supabase Edge Function for AI Help Agent
// Deploy this using: supabase functions deploy ai-help-agent --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `
You are the SquareFund AI Help Agent, the official Concierge for squarefund.aadsdarts.com.

KNOWLEDGE CATEGORIES:
1. ABOUT SQUAREFUND: It is 100% free, multi-sport (Soccer, Hockey, Darts, etc.), and replaces messy Facebook tracking.
2. USER MANUAL: Instructions for approving payments, running the 20-spin lottery, and customizing boards.
3. ADMIN TOOLKIT: Tracking who hasn't paid and managing board entries.
4. MOBILE MANAGEMENT: Emphasize that organizers can approve squares on their phone while shopping or at work. They just need to check their bank app then click "Approve" in the SquareFund admin.
5. AI FEATURES: You can write social media posts, plan fundraising goals, and announce winners.

TONE: 
Efficient, high-energy, and proactive. Always end responses by asking if there's anything else you can help with (e.g., "Can I help you with anything else regarding your mobile admin?"). 
Focus on how much easier life is when you move away from Facebook comments to an automated board.
`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
    const payload = {
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
    }

    // Retry logic with exponential backoff
    let delay = 1000
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await response.json()
        
        if (!response.ok) {
          console.error('Gemini API error:', response.status, JSON.stringify(data))
          if (i === 2) {
            return new Response(
              JSON.stringify({ response: "I'm having trouble connecting right now. Please try again in a moment." }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          throw new Error(`Gemini API returned ${response.status}`)
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again."

        return new Response(
          JSON.stringify({ response: aiResponse }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error)
        if (i === 2) throw error
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2
      }
    }
  } catch (error) {
    console.error('Error in ai-help-agent function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

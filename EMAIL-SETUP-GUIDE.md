# Email Confirmation Setup Guide

This guide will help you set up automatic confirmation emails when users' purchases are approved.

## Overview

When a user makes a purchase:
1. They enter their name and email address
2. Email is saved to the database with their squares
3. When admin approves the payment (marks as sold)
4. An automatic confirmation email is sent to the user

## Setup Steps

### Step 1: Get a Resend API Key (Free Email Service)

1. Go to [resend.com](https://resend.com) and sign up (free tier: 100 emails/day)
2. Verify your email address
3. Go to **API Keys** → **Create API Key**
4. Copy the API key (starts with `re_...`)

### Step 2: Deploy the Edge Function

1. Install Supabase CLI if you haven't:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase CLI:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   cd E:\Squarefund
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in Supabase Dashboard URL: `supabase.co/dashboard/project/YOUR_PROJECT_REF`)

4. Set the Resend API key as a secret:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_key_here
   ```

5. Deploy the Edge Function:
   ```bash
   supabase functions deploy send-confirmation-email
   ```

### Step 3: Enable pg_net Extension

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

### Step 4: Create the Database Trigger

1. In Supabase SQL Editor, run the contents of `add-email-confirmation-trigger.sql`
2. This creates a trigger that automatically sends emails when admin approves purchases

### Step 5: Configure Email Domain (Optional but Recommended)

For production use, add your own domain to Resend:

1. In Resend dashboard → **Domains** → **Add Domain**
2. Add your domain (e.g., `fundraiser.aads.com`)
3. Update DNS records as instructed
4. Update the Edge Function's `from` field:
   ```typescript
   from: 'AADS Fundraiser <noreply@fundraiser.aads.com>'
   ```

## How It Works

1. **User submits purchase** → Name & email saved to database
2. **Admin approves** → Clicks "Approve Payment" button
3. **Database trigger fires** → Detects square marked as sold
4. **Edge Function called** → Sends email via Resend API
5. **User receives email** → Confirmation with their square numbers

## Testing

1. Make a test purchase on the fundraiser page
2. Use a real email address you can check
3. Go to admin page and approve the payment
4. Check your inbox for the confirmation email

## Troubleshooting

**Email not sending?**
- Check Supabase Edge Function logs: Dashboard → Edge Functions → Logs
- Verify RESEND_API_KEY is set correctly
- Ensure pg_net extension is enabled
- Check Resend dashboard for delivery status

**Using Resend Free Tier?**
- You can send to any email in development
- For production, verify your domain
- Limit: 100 emails/day, 3,000/month

## Alternative: Manual Email Sending

If you don't want to set up Edge Functions, you can manually email buyers:

1. Go to Supabase Table Editor → `squares`
2. Filter by `sold = true`
3. Export the buyer_email and buyer_name columns
4. Send emails manually or use a bulk email tool

## Cost

- **Resend Free Tier**: 100 emails/day, 3,000/month - FREE
- **Resend Pro**: $20/month for 50,000 emails
- **Supabase Edge Functions**: Included in free tier (up to 500K function invocations/month)

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_square_approved ON squares;
DROP FUNCTION IF EXISTS send_confirmation_email_trigger();

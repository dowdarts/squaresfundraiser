# AI Help Agent Deployment Guide

This guide shows you how to deploy the AI Help Agent Edge Function with secure API key storage.

## Prerequisites
- Supabase CLI installed
- Supabase project set up (already done)
- Gemini API key: `AIzaSyA460wJWqiE3otgfaeAOVJrssFGrUYxv78`

## Deployment Steps

### 1. Login to Supabase CLI
```powershell
supabase login
```

### 2. Link to your project
```powershell
supabase link --project-ref xsmrquoivqrxalxjqxdw
```

### 3. Set the Gemini API key as a secret
This stores the API key securely on Supabase's servers (not in your code):
```powershell
supabase secrets set GEMINI_API_KEY=AIzaSyA460wJWqiE3otgfaeAOVJrssFGrUYxv78
```

### 4. Deploy the Edge Function
```powershell
supabase functions deploy ai-help-agent --no-verify-jwt
```

The `--no-verify-jwt` flag allows public access since this is a help agent that doesn't need authentication.

## What Changed

### Before (Insecure)
- API key was hardcoded in `helper.html`
- Anyone viewing source code could see and abuse the key
- Unsafe to commit to GitHub

### After (Secure)
- API key stored as Supabase secret (encrypted, server-side only)
- `helper.html` calls Edge Function via HTTPS
- Safe to commit all code to GitHub
- API key never exposed to users

## Files Modified
1. **Created:** `supabase/functions/ai-help-agent/index.ts` - Edge Function that securely calls Gemini API
2. **Updated:** `helper.html` - Now calls Edge Function instead of Gemini directly

## Testing
After deployment, test the AI Help Agent on your website. It should work exactly the same, but now the API key is secure!

## Backup Safety
You can now safely:
- Commit all files to GitHub
- Share your repository publicly
- Push to remote backups

The API key is stored separately in Supabase and never exposed in your code.

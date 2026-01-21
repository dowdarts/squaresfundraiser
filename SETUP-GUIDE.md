# AADS Fundraiser - Supabase Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (free tier is perfect for this)
3. Create a new project
4. Choose a name like "aads-fundraiser"
5. Generate a secure password (save it)
6. Select a region close to your users

### Step 2: Set Up the Database
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-setup.sql`
4. Paste and click "RUN"
5. You should see "Success. No rows returned"

### Step 3: Enable Realtime
1. Go to **Database** → **Replication**
2. Find the `squares` table
3. Toggle it ON (this enables real-time updates)

### Step 4: Get Your API Keys
1. Go to **Project Settings** (gear icon)
2. Click **API**
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 5: Update index.html
1. Open `index.html`
2. Find these lines (near the top of the `<script>` section):
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbG...your-key-here';
   ```

### Step 6: Add Your Background Image
1. Save your promotional background image as `background.jpg` in the same folder as `index.html`
2. The image should showcase your prize (e.g., darts shirts)
3. The grid will automatically overlay on top of the image

### Step 7: Configure eTransfer Email (Admin Only)
1. Run the `add-settings-table.sql` migration in Supabase SQL Editor
2. Open `admin.html` in your browser
3. Go to the "Settings" tab
4. Enter your eTransfer email address where payments should be sent
5. Click "Save Settings"

### Step 8: Test It!
1. Open `index.html` in a browser
2. Click a square
3. Click "Confirm & Pay"
4. Open the same page in another browser/tab
5. The sold square should appear red in both!

## Features You Now Have

✅ **Real-time sync** - Multiple users see updates instantly  
✅ **Race condition protection** - Two people can't buy the same square  
✅ **Persistent data** - Sold squares stay sold across page refreshes  
✅ **Automatic counting** - Remaining squares update for everyone  
✅ **Scalable** - Supabase free tier supports unlimited API requests

## Next Steps (Optional Enhancements)

### Add Payment Processing
To collect real money, integrate:
- **Stripe** (recommended) - `npm install @stripe/stripe-js`
- **PayPal** - Add PayPal buttons
- **Square** - For in-person payments too

### Collect Buyer Information
Add a form before payment to capture:
- Name
- Email
- Phone number
- Shirt size preference

Update the `processPayment()` function to save this info to Supabase.

### Admin Dashboard
Create a separate admin page to:
- View all sold squares and buyer details
- Mark a winner
- Reset the board for a new fundraiser
- Export buyer list

### Email Notifications
Use Supabase Edge Functions to:
- Send confirmation emails to buyers
- Notify admins of new purchases
- Announce the winner

## Troubleshooting

**"Failed to load squares"**
- Check your API keys are correct
- Verify the SQL was run successfully
- Make sure RLS policies are enabled

**"Square was just purchased"**
- This is normal! It means the race condition protection worked
- The square was sold to someone else first

**Updates not appearing in real-time**
- Check that Replication is enabled for the `squares` table
- Verify you're calling `subscribeToSquareChanges()`

## Security Note
The `anon` key is safe to expose publicly. Supabase's Row Level Security (RLS) policies ensure users can only:
- Read all squares
- Update unsold squares to sold (but not back to unsold)

For admin operations (resetting, viewing buyer info), create protected routes with authentication.

## Cost
Supabase free tier includes:
- 500 MB database space (you'll use < 1 MB)
- Unlimited API requests
- Unlimited realtime connections
- Social OAuth (if you add login later)

Perfect for small fundraisers! For larger scale, paid tiers start at $25/month.

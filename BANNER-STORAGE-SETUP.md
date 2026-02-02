# Banner Image Storage Setup

## Quick Setup (2 minutes)

To enable banner images for your fundraisers, you need to create a storage bucket in Supabase.

### Step 1: Create the Storage Bucket
1. Go to your Supabase dashboard
2. Click **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name it: `fundraiser-banners`
5. Make it **Public** (toggle ON)
6. Click **Create bucket**

### Step 2: Set Permissions (Important!)
1. Click on the `fundraiser-banners` bucket
2. Go to **Policies** tab
3. Click **New Policy**

**Policy 1 - Allow Public Read:**
1. Click **New Policy**
2. Select **For full customization**
3. Name: `Public read access`
4. Allowed operation: **SELECT**
5. Policy definition (copy exactly, no backticks):
```
true
```
6. Click **Review** then **Save policy**

**Policy 2 - Allow Authenticated Upload:**
1. Click **New Policy**
2. Select **For full customization**
3. Name: `Authenticated users can upload`
4. Allowed operation: **INSERT**
5. Policy definition (copy exactly, no backticks):
```
(bucket_id = 'fundraiser-banners') AND (auth.role() = 'authenticated')
```
6. Click **Review** then **Save policy**

**Policy 3 - Allow Authenticated Update:**
1. Click **New Policy**
2. Select **For full customization**
3. Name: `Authenticated users can update`
4. Allowed operation: **UPDATE**
5. Policy definition (copy exactly, no backticks):
```
(bucket_id = 'fundraiser-banners') AND (auth.role() = 'authenticated')
```
6. Click **Review** then **Save policy**

### Step 3: Test It!
1. Go to your admin dashboard
2. Create or edit a fundraiser
3. Upload a banner image
4. It should work now! 🎉

## Troubleshooting

If you still can't create a bucket:
- **Free tier limit reached**: Supabase free tier allows limited storage. You may need to upgrade.
- **Use external hosting**: Upload your banner to Imgur, Cloudinary, or GitHub and paste the URL in the database manually.

## Alternative: Manual Banner URLs

If you can't set up storage, you can manually add banner URLs:
1. Upload your image to any image hosting service (Imgur, Cloudinary, etc.)
2. Get the public URL
3. Go to Supabase dashboard → Table Editor → `fundraisers` table
4. Find your fundraiser row
5. Edit the `banner_url` column and paste the URL
6. Save!

Your banner will now appear on the fundraiser page.

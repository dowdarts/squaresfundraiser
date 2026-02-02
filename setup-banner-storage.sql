-- Setup Banner Storage Bucket and Policies
-- Run this in Supabase SQL Editor to automatically create the bucket and set permissions

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('fundraiser-banners', 'fundraiser-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow public to read/download banner images
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'fundraiser-banners');

-- Policy 2: Allow authenticated users to upload banner images
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fundraiser-banners' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their banner images
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'fundraiser-banners' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'fundraiser-banners' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete their banner images
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fundraiser-banners' 
  AND auth.role() = 'authenticated'
);

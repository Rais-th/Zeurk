-- Setup Supabase Storage bucket for user avatars
-- This script creates the avatars bucket with proper RLS policies

-- Create the avatars bucket if it doesn't exist
DO $$
BEGIN
    BEGIN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true)
        ON CONFLICT (id) DO NOTHING;
        RAISE NOTICE 'Avatars bucket created or already exists!';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create avatars bucket - insufficient privileges. This is expected if you are not a superuser.';
    END;
END $$;

-- Enable RLS on the storage.objects table (should already be enabled)
DO $$
BEGIN
    BEGIN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS enabled on storage.objects table!';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not enable RLS - insufficient privileges. This is expected if you are not a superuser.';
    END;
END $$;

-- Create policy for users to upload their own avatars
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
        CREATE POLICY "Users can upload their own avatar" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'avatars' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
        RAISE NOTICE 'Created upload policy successfully!';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create upload policy - insufficient privileges. This is expected if you are not a superuser.';
    END;
END $$;

-- Create policy for users to update their own avatars
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
        CREATE POLICY "Users can update their own avatar" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'avatars' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
        RAISE NOTICE 'Created update policy successfully!';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create update policy - insufficient privileges. This is expected if you are not a superuser.';
    END;
END $$;

-- Create policy for users to delete their own avatars
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
        CREATE POLICY "Users can delete their own avatar" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'avatars' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
        RAISE NOTICE 'Created delete policy successfully!';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create delete policy - insufficient privileges. This is expected if you are not a superuser.';
    END;
END $$;

-- Create policy for public read access to avatars
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
        CREATE POLICY "Anyone can view avatars" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
        RAISE NOTICE 'Created public read policy successfully!';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not create public read policy - insufficient privileges. This is expected if you are not a superuser.';
    END;
END $$;

-- Grant necessary permissions (wrapped in exception handling)
DO $$
BEGIN
    BEGIN
        GRANT ALL ON storage.objects TO authenticated;
        GRANT ALL ON storage.buckets TO authenticated;
        RAISE NOTICE 'Permissions granted successfully!';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'Could not grant permissions - insufficient privileges. This is expected if you are not a superuser.';
    END;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Avatars storage bucket setup completed successfully!';
END $$;
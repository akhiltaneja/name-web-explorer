
-- Create anon_users table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_anon_users_table_if_not_exists()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'anon_users'
  ) THEN
    CREATE TABLE public.anon_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      identifier TEXT NOT NULL UNIQUE,
      search_count INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      last_seen TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add RLS policies
    ALTER TABLE public.anon_users ENABLE ROW LEVEL SECURITY;
    
    -- Only admin users can view anon_users
    CREATE POLICY "Only admin users can view anonymous users" ON public.anon_users
      FOR SELECT USING (
        -- Check admin email
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND email = 'akhiltaneja92@gmail.com'
        )
      );
    
    -- Only admin users can insert anon_users
    CREATE POLICY "Only admin users can insert anonymous users" ON public.anon_users
      FOR INSERT WITH CHECK (
        -- Check admin email
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND email = 'akhiltaneja92@gmail.com'
        )
      );
    
    -- Only admin users can update anon_users
    CREATE POLICY "Only admin users can update anonymous users" ON public.anon_users
      FOR UPDATE USING (
        -- Check admin email
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND email = 'akhiltaneja92@gmail.com'
        )
      );
      
    -- Create index on identifier for faster lookups
    CREATE INDEX anon_users_identifier_idx ON public.anon_users (identifier);
  END IF;
END;
$function$;

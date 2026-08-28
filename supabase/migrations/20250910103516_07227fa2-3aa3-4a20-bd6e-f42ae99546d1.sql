-- Secure predictions: remove public read, enforce mine-site RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Remove any known demo/public policy
DROP POLICY IF EXISTS "Demo access to predictions" ON public.predictions;

-- Ensure the restrictive policy exists with correct definition
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'predictions' 
      AND polname = 'Users can view predictions for their mine sites'
  ) THEN
    ALTER POLICY "Users can view predictions for their mine sites"
    ON public.predictions
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND (p.mine_site_id = public.predictions.mine_site_id OR p.role = 'admin')
      )
    );
  ELSE
    CREATE POLICY "Users can view predictions for their mine sites"
    ON public.predictions
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND (p.mine_site_id = public.predictions.mine_site_id OR p.role = 'admin')
      )
    );
  END IF;
END $$;

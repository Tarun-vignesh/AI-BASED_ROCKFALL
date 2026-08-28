-- Tighten RLS on public.predictions to prevent public access
-- 1) Ensure RLS is enabled
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- 2) Remove overly-permissive demo policy
DROP POLICY IF EXISTS "Demo access to predictions" ON public.predictions;

-- 3) Restrict read access to authenticated users assigned to the same mine site, or admins
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

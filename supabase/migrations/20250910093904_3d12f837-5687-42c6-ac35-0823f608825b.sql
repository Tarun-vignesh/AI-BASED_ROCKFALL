-- Demo policies to enable buttons without auth

-- Alerts: allow public select and insert (demo)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'Demo: public read alerts'
  ) THEN
    CREATE POLICY "Demo: public read alerts" ON public.alerts FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'Demo: allow insert alerts'
  ) THEN
    CREATE POLICY "Demo: allow insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Alert deliveries: allow public select and insert (demo)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_deliveries' AND policyname = 'Demo: public read alert_deliveries'
  ) THEN
    CREATE POLICY "Demo: public read alert_deliveries" ON public.alert_deliveries FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'alert_deliveries' AND policyname = 'Demo: allow insert alert_deliveries'
  ) THEN
    CREATE POLICY "Demo: allow insert alert_deliveries" ON public.alert_deliveries FOR INSERT WITH CHECK (true);
  END IF;
END $$;
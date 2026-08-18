CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('base','median')),
  code text,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription read" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.plan_codes (
  code text PRIMARY KEY,
  plan text NOT NULL CHECK (plan IN ('base','median')),
  is_used boolean NOT NULL DEFAULT false,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.plan_codes TO service_role;
ALTER TABLE public.plan_codes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.redeem_plan_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code public.plan_codes%ROWTYPE;
  v_days int;
  v_base timestamptz;
  v_expires timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_signed_in');
  END IF;

  SELECT * INTO v_code FROM public.plan_codes
  WHERE upper(btrim(code)) = upper(btrim(_code)) FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;
  IF v_code.is_used THEN
    RETURN jsonb_build_object('ok', false, 'error', 'code_used');
  END IF;

  v_days := CASE WHEN v_code.plan = 'median' THEN 90 ELSE 30 END;

  SELECT greatest(now(), coalesce(max(expires_at), now())) INTO v_base
  FROM public.subscriptions WHERE user_id = v_uid;
  v_expires := coalesce(v_base, now()) + make_interval(days => v_days);

  INSERT INTO public.subscriptions (user_id, plan, code, started_at, expires_at)
  VALUES (v_uid, v_code.plan, v_code.code, now(), v_expires)
  ON CONFLICT (user_id) DO UPDATE
    SET plan = EXCLUDED.plan, code = EXCLUDED.code, expires_at = EXCLUDED.expires_at;

  UPDATE public.plan_codes
  SET is_used = true, used_by = v_uid, used_at = now()
  WHERE code = v_code.code;

  RETURN jsonb_build_object('ok', true, 'plan', v_code.plan, 'expires_at', v_expires);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_plan_code(text) FROM public;
GRANT EXECUTE ON FUNCTION public.redeem_plan_code(text) TO authenticated;

INSERT INTO public.plan_codes (code, plan) VALUES
  ('HAZRI-BASE-1001','base'),
  ('HAZRI-BASE-1002','base'),
  ('HAZRI-BASE-1003','base'),
  ('HAZRI-BASE-1004','base'),
  ('HAZRI-BASE-1005','base'),
  ('HAZRI-MED-2001','median'),
  ('HAZRI-MED-2002','median'),
  ('HAZRI-MED-2003','median'),
  ('HAZRI-MED-2004','median'),
  ('HAZRI-MED-2005','median');
REVOKE ALL ON FUNCTION public.redeem_plan_code(text) FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
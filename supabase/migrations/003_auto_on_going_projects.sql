-- Auto-mark funded-but-not-complete projects as On Going.
--
-- Rule:
--   - Count only payment_releases.status = 'Released'.
--   - If total released >= project budget, set project status to 'Completed'.
--   - If total released > 0 and < project budget, set project status from 'Pending' to 'On Going'.
--   - Never change Cancelled projects.
--   - Do not auto-downgrade Completed or On Hold projects.

CREATE OR REPLACE FUNCTION public.sync_project_completion(target_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_released numeric;
  project_budget numeric;
BEGIN
  SELECT COALESCE(SUM(pr.amount), 0)
  INTO total_released
  FROM public.payment_releases pr
  WHERE pr.project_id = target_project_id
    AND pr.status = 'Released';

  SELECT p.budget
  INTO project_budget
  FROM public.projects p
  WHERE p.id = target_project_id;

  IF project_budget IS NULL OR project_budget <= 0 THEN
    RETURN;
  END IF;

  IF total_released >= project_budget THEN
    UPDATE public.projects
    SET status = 'Completed'
    WHERE id = target_project_id
      AND status <> 'Cancelled';
  ELSIF total_released > 0 THEN
    UPDATE public.projects
    SET status = 'On Going'
    WHERE id = target_project_id
      AND status = 'Pending';
  END IF;
END;
$$;

-- One-time backfill for existing projects that already have partial released payments.
UPDATE public.projects p
SET status = 'On Going'
WHERE p.status = 'Pending'
  AND p.budget > 0
  AND (
    SELECT COALESCE(SUM(pr.amount), 0)
    FROM public.payment_releases pr
    WHERE pr.project_id = p.id
      AND pr.status = 'Released'
  ) > 0
  AND (
    SELECT COALESCE(SUM(pr.amount), 0)
    FROM public.payment_releases pr
    WHERE pr.project_id = p.id
      AND pr.status = 'Released'
  ) < p.budget;

-- Keep the completed-status backfill here too, so this migration is safe to run
-- even if the previous manual backfill was not applied in another environment.
UPDATE public.projects p
SET status = 'Completed'
WHERE p.status <> 'Cancelled'
  AND p.budget > 0
  AND (
    SELECT COALESCE(SUM(pr.amount), 0)
    FROM public.payment_releases pr
    WHERE pr.project_id = p.id
      AND pr.status = 'Released'
  ) >= p.budget;

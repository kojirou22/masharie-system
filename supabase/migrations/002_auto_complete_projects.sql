-- Auto-complete projects once released payments reach the project budget.
--
-- Rule:
--   - Count only payment_releases.status = 'Released'.
--   - If total released >= project budget, set project status to 'Completed'.
--   - Never change Cancelled projects.
--   - This is one-way: it does not automatically downgrade Completed projects if
--     payments are later cancelled/deleted or the budget is increased.

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

  IF project_budget IS NULL THEN
    RETURN;
  END IF;

  IF project_budget > 0 AND total_released >= project_budget THEN
    UPDATE public.projects
    SET status = 'Completed'
    WHERE id = target_project_id
      AND status <> 'Cancelled';
  END IF;
END;
$$;


CREATE OR REPLACE FUNCTION public.handle_payment_project_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.sync_project_completion(OLD.project_id);
    RETURN OLD;
  END IF;

  PERFORM public.sync_project_completion(NEW.project_id);

  IF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
    PERFORM public.sync_project_completion(OLD.project_id);
  END IF;

  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_payment_project_completion ON public.payment_releases;

CREATE TRIGGER trg_payment_project_completion
AFTER INSERT OR UPDATE OR DELETE ON public.payment_releases
FOR EACH ROW
EXECUTE FUNCTION public.handle_payment_project_completion();


CREATE OR REPLACE FUNCTION public.handle_project_budget_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_project_completion(NEW.id);
  RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_project_budget_completion ON public.projects;

CREATE TRIGGER trg_project_budget_completion
AFTER UPDATE OF budget ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_project_budget_completion();

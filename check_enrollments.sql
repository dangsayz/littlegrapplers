-- Check for Bobbie and Gracie enrollments
SELECT 
  id,
  child_first_name,
  child_last_name,
  guardian_email,
  status,
  submitted_at,
  stripe_checkout_session_id,
  plan_type
FROM enrollments 
WHERE child_first_name ILIKE '%bobbie%' 
   OR child_first_name ILIKE '%gracie%'
   OR guardian_email ILIKE '%bobbie%'
ORDER BY submitted_at DESC;

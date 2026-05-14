-- Quick operational checks for ME WE backend

-- 1) Access failure trends (last 24h)
select
  date_trunc('hour', attempted_at) as hour_bucket,
  count(*) filter (where success = false) as failed_attempts,
  count(*) filter (where success = true) as successful_attempts
from public.pair_access_attempts
where attempted_at > now() - interval '24 hours'
group by 1
order by 1;

-- 2) Admin destructive actions
select
  created_at,
  actor_user_id,
  action_type,
  pair_id,
  metadata
from public.admin_actions_audit
order by created_at desc
limit 100;

-- 3) Pair completion funnel
with pair_state as (
  select
    p.id,
    max(case when pt.role = 'mother' and pt.is_completed then 1 else 0 end) as mother_done,
    max(case when pt.role = 'daughter' and pt.is_completed then 1 else 0 end) as daughter_done
  from public.pairs p
  left join public.participants pt on pt.pair_id = p.id
  where p.deleted_at is null
  group by p.id
)
select
  count(*) as total_pairs,
  count(*) filter (where mother_done = 1) as mother_completed,
  count(*) filter (where daughter_done = 1) as daughter_completed,
  count(*) filter (where mother_done = 1 and daughter_done = 1) as both_completed
from pair_state;

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Start local Supabase and export credentials (see README / CI workflow).`,
    );
  }
  return value;
}

export function getE2EEnv() {
  return {
    url: required("SUPABASE_URL"),
    anonKey: required("SUPABASE_ANON_KEY"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

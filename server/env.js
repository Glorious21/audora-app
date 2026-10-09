/**
 * Values pasted into a host's dashboard (or imported from a Windows .env) can
 * carry a trailing newline or \r, which breaks MemWal request signing. Imported
 * first by app.js so every module sees the cleaned values.
 */
for (const k of ["MEMWAL_ACCOUNT_ID", "MEMWAL_KEY", "MEMWAL_SERVER_URL", "MEMWAL_NAMESPACE", "ANTHROPIC_API_KEY"]) {
  if (typeof process.env[k] === "string") process.env[k] = process.env[k].trim();
}

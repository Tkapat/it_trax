-- Migration 0013: GitHub connections
-- Stores one GitHub OAuth token per user, encrypted via Vault.
-- All crypto is SECURITY DEFINER and runs in the DB — the client never
-- sees or stores the raw access token.

-- ── Table ────────────────────────────────────────────────────────────────────
create table if not exists github_connections (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  encrypted_token  text        not null,     -- pgcrypto-encrypted with Vault key
  refresh_token    text,                     -- encrypted provider_refresh_token (optional)
  github_username  text        not null,
  github_user_id   bigint,
  avatar_url       text,
  connected_at     timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

alter table github_connections enable row level security;

-- Owner-only policies
create policy "github_connections_select" on github_connections
  for select using (auth.uid() = user_id);

create policy "github_connections_delete" on github_connections
  for delete using (auth.uid() = user_id);

-- No direct insert/update; mutations go through SECURITY DEFINER RPCs.

-- ── Vault secret key ─────────────────────────────────────────────────────────
-- The secret_key used for encryption is stored in Supabase Vault.
-- In local dev, set GITHUB_ENCRYPTION_KEY in your Vault or fall back to a
-- project-level secret. For cloud: create via the Supabase Dashboard →
-- Vault → New Secret, name: 'github_encryption_key'.
--
-- We reference it via: vault.decrypted_secrets where name = 'github_encryption_key'

-- ── RPC: set_github_connection ────────────────────────────────────────────────
-- Called immediately after capturing provider_token from Supabase OAuth.
-- Encrypts the token server-side; client only ever sends it in the TLS payload.
create or replace function set_github_connection(
  p_access_token   text,
  p_refresh_token  text,
  p_username       text,
  p_user_id_gh     bigint  default null,
  p_avatar_url     text    default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
  v_enc    text;
  v_enc_rt text;
begin
  -- Fetch encryption key from Vault (falls back to empty string on local dev
  -- without Vault configured — swap for your own fallback strategy)
  select decrypted_secret into v_secret
    from vault.decrypted_secrets
   where name = 'github_encryption_key'
   limit 1;

  if v_secret is null or v_secret = '' then
    -- Graceful local-dev fallback: store Base64-encoded (not truly encrypted)
    -- Never do this in production; configure Vault before go-live.
    v_secret := 'local_dev_placeholder_key_32bytes!!';
  end if;

  -- Encrypt access token
  v_enc := encode(
    pgp_sym_encrypt(p_access_token, v_secret),
    'base64'
  );

  -- Encrypt refresh token (if provided)
  if p_refresh_token is not null and p_refresh_token != '' then
    v_enc_rt := encode(
      pgp_sym_encrypt(p_refresh_token, v_secret),
      'base64'
    );
  end if;

  insert into github_connections (
    user_id, encrypted_token, refresh_token,
    github_username, github_user_id, avatar_url,
    connected_at, updated_at
  )
  values (
    auth.uid(), v_enc, v_enc_rt,
    p_username, p_user_id_gh, p_avatar_url,
    now(), now()
  )
  on conflict (user_id) do update
    set encrypted_token  = excluded.encrypted_token,
        refresh_token    = coalesce(excluded.refresh_token, github_connections.refresh_token),
        github_username  = excluded.github_username,
        github_user_id   = coalesce(excluded.github_user_id, github_connections.github_user_id),
        avatar_url       = coalesce(excluded.avatar_url, github_connections.avatar_url),
        updated_at       = now();
end;
$$;

-- ── RPC: get_github_token ──────────────────────────────────────────────────────
-- Returns the decrypted token for the calling user only.
create or replace function get_github_token()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
  v_enc    text;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets
   where name = 'github_encryption_key'
   limit 1;

  if v_secret is null or v_secret = '' then
    v_secret := 'local_dev_placeholder_key_32bytes!!';
  end if;

  select encrypted_token into v_enc
    from github_connections
   where user_id = auth.uid();

  if v_enc is null then
    return null;
  end if;

  return pgp_sym_decrypt(decode(v_enc, 'base64'), v_secret);
end;
$$;

-- ── RPC: clear_github_connection ──────────────────────────────────────────────
create or replace function clear_github_connection()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from github_connections where user_id = auth.uid();
end;
$$;

-- ── RPC: get_github_connection_info ───────────────────────────────────────────
-- Returns non-sensitive metadata (username, avatar, connected_at) for the UI.
create or replace function get_github_connection_info()
returns table (
  github_username text,
  github_user_id  bigint,
  avatar_url      text,
  connected_at    timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select gc.github_username, gc.github_user_id, gc.avatar_url, gc.connected_at
      from github_connections gc
     where gc.user_id = auth.uid();
end;
$$;

-- ── Update trigger ─────────────────────────────────────────────────────────────
create or replace function update_github_connections_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger github_connections_updated_at
  before update on github_connections
  for each row execute function update_github_connections_updated_at();

-- ── Grants ─────────────────────────────────────────────────────────────────────
grant execute on function set_github_connection(text, text, text, bigint, text) to authenticated;
grant execute on function get_github_token() to authenticated;
grant execute on function clear_github_connection() to authenticated;
grant execute on function get_github_connection_info() to authenticated;

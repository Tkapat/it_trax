-- Migration 0014: Add GitHub repo link columns to projects
-- Normalised owner/repo slug (e.g. "acme/my-app") is cleaner than a full URL.
-- We keep the existing github_url column for display/external linking.

alter table projects
  add column if not exists github_repo            text,   -- "owner/repo" slug, e.g. "acme/my-app"
  add column if not exists github_default_branch  text;   -- "main", "master", etc.

comment on column projects.github_repo is
  'GitHub repo slug in owner/repo format, e.g. "acme/my-app". Null if not linked.';
comment on column projects.github_default_branch is
  'Default branch to use for README/file browsing. Falls back to "main" if null.';

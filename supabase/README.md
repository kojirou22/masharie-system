# Supabase

This directory holds Supabase configuration and migrations.

## Structure

```
supabase/
  migrations/   # SQL migration files (applied via `supabase db push`)
```

## Usage

1. Install the Supabase CLI
2. Run `supabase link --project-ref <ref>` to connect to your project
3. Create migrations: `supabase migration new <name>`
4. Apply: `supabase db push`

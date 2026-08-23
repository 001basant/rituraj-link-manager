# Rituraj Link Manager

This project gives you:

- Public Instagram bio link page
- Private `/admin/` dashboard
- Supabase email/password authentication
- Add / edit / delete / hide / show links
- Profile editing
- Cloud database
- Public page automatically shows only enabled links

## 1. Create Supabase project
Open https://supabase.com/ and create a project.

## 2. Run the database SQL
Open SQL Editor in Supabase and run:
`supabase/schema.sql`

## 3. Create the admin account
In Supabase:
Authentication → Users → Add user
Create your email/password.

## 4. Add Supabase keys
Edit `supabase.js` at the project root:
- YOUR_SUPABASE_URL
- YOUR_SUPABASE_ANON_KEY

Get these from:
Supabase → Project Settings → API

## 5. Update your profile
Open:
`admin/index.html`
Use the admin dashboard to set:
- name
- username
- profile photo URL
- bio
- links

## 6. Hosting
You can deploy this folder to any static host such as Netlify, Vercel, GitHub Pages, or Cloudflare Pages.
Keep the folder structure unchanged so `/admin/` and imports work.

## Security note
The Supabase anon key is safe to expose in a browser when Row Level Security (RLS) policies are configured correctly. Never expose a Supabase service-role key in frontend files.

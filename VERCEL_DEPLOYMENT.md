# Vercel Deployment Guide

## Prerequisites
- Vercel account (free)
- GitHub repository with the code
- Supabase project with configured users table

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Production ready - prepared for Vercel"
git push origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Select your GitHub repository
4. Click **Import**

## Step 3: Configure Environment Variables

On the Vercel dashboard, go to **Settings** → **Environment Variables**

Add these two variables:
- Key: `VITE_SUPABASE_URL` | Value: `https://gachrpyxarbkwqfxjiev.supabase.co`
- Key: `VITE_SUPABASE_ANON_KEY` | Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your key)

Click **Save**

## Step 4: Deploy

Click **Deploy** button. Vercel will:
- Build the project
- Run `npm run build`
- Deploy to production

Wait 2-3 minutes for deployment to complete.

## Step 5: Verify

1. Click the production URL from Vercel dashboard
2. Login with a test account
3. Verify all dashboards load
4. Test admin upload page

## Automatic Deployments

Any push to main branch will trigger automatic redeploy.

To disable: Go to **Settings** → **Git** → Disable Auto-Deploy

## Production Checklist

- ✅ All hardcoded values removed
- ✅ Demo credentials removed from login page
- ✅ Environment variables configured
- ✅ Supabase authentication working
- ✅ Excel upload functional for admins
- ✅ All department dashboards visible
- ✅ Database tables created in Supabase
- ✅ User roles configured

## Troubleshooting

### "Can't log in after deployment"
→ Verify environment variables are set in Vercel dashboard
→ Check Supabase users table has your test accounts

### "Upload page not visible for admin"
→ Check user role in Supabase: `SELECT email, role FROM public.users;`
→ Role must be exactly 'admin'

### "Dashboard shows no data"
→ Upload Excel file via Upload KPI page
→ Verify data was imported to Supabase tables
→ Hard refresh browser (Cmd+Shift+R)

## Update Deployments

To update:
1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Vercel auto-deploys

## Rollback

If something goes wrong:
1. Go to Vercel **Deployments** tab
2. Find previous working deployment
3. Click menu → **Promote to Production**

---

**Questions?** Check SUPABASE_AUTH_SETUP.md for authentication troubleshooting.

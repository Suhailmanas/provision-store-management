# Manas Store PWA - Deployment Guide

## Prerequisites

This application requires a Neon PostgreSQL database and the following environment variables configured in your Vercel project.

## Required Environment Variables

### 1. DATABASE_URL
**Description**: PostgreSQL connection string from your Neon database
**Format**: `postgresql://user:password@host/database?sslmode=require`
**How to get**:
- Create a database on [Neon](https://neon.tech)
- Copy the connection string from your Neon dashboard
- Add it to your Vercel project settings under "Settings" → "Environment Variables"

### 2. BETTER_AUTH_SECRET
**Description**: Secret key for session encryption and security
**Format**: Random base64-encoded string (minimum 32 characters)
**How to generate**:
```bash
openssl rand -base64 32
```
**How to add**:
- Copy the generated string
- Add it to your Vercel project settings under "Settings" → "Environment Variables"
- Set key as `BETTER_AUTH_SECRET`

## Setup Steps

### Step 1: Create Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Click "Settings" in the top navigation
3. Navigate to "Environment Variables" in the left sidebar
4. Add the two variables above (DATABASE_URL and BETTER_AUTH_SECRET)
5. Make sure to add them to the **Production** environment

### Step 2: Deploy to Vercel
```bash
# Push your code to GitHub
git push origin main

# Or manually deploy using Vercel CLI
vercel deploy --prod
```

### Step 3: Verify Deployment
1. Wait for the deployment to complete
2. Click the deployment link to test the application
3. You should be redirected to the sign-in page
4. Create a new account to test the app

## Troubleshooting

### Error: "This page couldn't load" (500 Error)
**Cause**: Missing environment variables
**Solution**: 
- Go to Vercel project settings
- Verify both `DATABASE_URL` and `BETTER_AUTH_SECRET` are set
- Redeploy the application

### Error: "Uncaught Error: An error occurred in the Server Components render"
**Cause**: Environment variables not properly configured
**Solution**:
1. Check the error message in the browser console
2. Verify environment variables in Vercel settings
3. Clear browser cache and reload
4. Check Vercel deployment logs for detailed errors

### Database Connection Failures
**Cause**: Incorrect DATABASE_URL or database not accessible
**Solution**:
1. Verify your Neon database is active
2. Test the connection string locally
3. Ensure IP whitelisting allows Vercel servers (Neon allows all by default)

## Development vs Production

### Development
- Uses placeholder values for some configs
- Relaxed cookie settings for iframe support
- Console warnings for missing optional variables

### Production
- Requires BETTER_AUTH_SECRET
- Enforces secure cookies (HTTPS only)
- Strict environment validation

## Environment Variable Checklist

Before deploying, ensure you have:
- [ ] DATABASE_URL from Neon
- [ ] BETTER_AUTH_SECRET generated with `openssl rand -base64 32`
- [ ] Both variables added to Vercel project settings
- [ ] Variables set for Production environment
- [ ] Redeployed after adding variables

## Monitoring

### Logs
Check deployment logs in Vercel dashboard for detailed error information:
- Go to "Deployments"
- Click on your deployment
- View the "Build Logs" or "Runtime Logs"

### Performance
The application includes Web Vitals monitoring:
- Automatic metrics collection in production
- Core Web Vitals: LCP, CLS, INP tracked
- Performance data sent to Vercel Analytics

## Support

If you encounter issues:
1. Check the error messages in browser console (F12 → Console)
2. Review Vercel deployment logs
3. Verify all environment variables are correctly set
4. Try redeploying the application
5. Clear browser cache and test in incognito mode

## Additional Notes

- The app uses Better Auth for email/password authentication
- Neon provides free tier with generous limits
- All user data is scoped by user ID (no data leakage between users)
- Offline support is built-in via Service Worker
- The app is fully mobile-responsive and PWA-compatible


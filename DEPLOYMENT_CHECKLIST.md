# SnackSecure Deployment Checklist

Use this checklist to ensure a smooth deployment to Railway or Render.

## Pre-Deployment Checklist

### 1. Local Testing
- [ ] Run `npm run build` to verify build succeeds
- [ ] Test production build locally using `./test-production.sh`
- [ ] Verify frontend loads at `http://localhost:3001`
- [ ] Test user registration and login
- [ ] Test manual assessment creation
- [ ] Test AI packaging analysis (requires GOOGLE_GEMINI_API_KEY)
- [ ] Test language switching (EN ↔ ZH)

### 2. Environment Variables Prepared
- [ ] Generate secure JWT_SECRET:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Have Google Gemini API key ready
- [ ] Copy these values somewhere safe (you'll need them for deployment)

### 3. Git Repository
- [ ] Initialize git: `git init` (if not already done)
- [ ] Review changes: `git status`
- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Prepare for production deployment"
  ```
- [ ] Create GitHub repository at https://github.com/new
- [ ] Add remote and push:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/snacksecure.git
  git branch -M main
  git push -u origin main
  ```

## Deployment Steps

### Option A: Railway (Recommended)

#### 1. Create Railway Project
- [ ] Go to https://railway.app
- [ ] Sign in with GitHub
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select your `snacksecure` repository
- [ ] Wait for initial deployment (it may fail without env vars - that's ok)

#### 2. Configure Environment Variables
Go to your project → Variables tab and add:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `JWT_SECRET` = `<your-generated-secret>`
- [ ] `GOOGLE_GEMINI_API_KEY` = `<your-gemini-api-key>`

#### 3. Trigger Redeploy
- [ ] After adding env vars, Railway will auto-redeploy
- [ ] Wait for deployment to complete (check Deployments tab)
- [ ] Click on the generated URL to access your app

#### 4. Verify Deployment
- [ ] App loads successfully
- [ ] Register a new user
- [ ] Create a manual assessment
- [ ] Upload and analyze a snack image
- [ ] Test language switching

### Option B: Render

#### 1. Create Web Service
- [ ] Go to https://render.com
- [ ] Click "New" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure:
  - Name: `snacksecure`
  - Environment: `Node`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`

#### 2. Add Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = `<your-generated-secret>`
- [ ] `GOOGLE_GEMINI_API_KEY` = `<your-gemini-api-key>`

#### 3. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (check Logs tab)
- [ ] Access your app via the provided URL

#### 4. Verify Deployment
- [ ] Same verification steps as Railway

## Post-Deployment

### Share with Friends
- [ ] Copy your deployment URL (e.g., `https://snacksecure-production.up.railway.app`)
- [ ] Test the URL in an incognito/private browser window
- [ ] Share URL with friends
- [ ] Provide basic usage instructions:
  1. Register for an account
  2. Create manual assessment OR upload snack image for AI analysis
  3. View assessment history
  4. Toggle language with button in header

### Monitoring
- [ ] Bookmark your Railway/Render dashboard
- [ ] Check logs if any issues arise
- [ ] Monitor Gemini API usage at https://aistudio.google.com/

### Future Updates
When you want to deploy updates:
1. Make changes locally
2. Test with `./test-production.sh`
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update description"
   git push
   ```
4. Railway/Render will auto-deploy the changes

## Troubleshooting

### Build Fails
- [ ] Check build logs in dashboard
- [ ] Verify all dependencies are in `package.json`
- [ ] Test build locally: `npm run build`

### App Doesn't Load
- [ ] Check that NODE_ENV=production is set
- [ ] Verify all environment variables are configured
- [ ] Check server logs for errors

### API Calls Fail
- [ ] Verify JWT_SECRET is set
- [ ] Check browser console for errors
- [ ] Verify CORS settings in server logs

### AI Analysis Fails
- [ ] Verify GOOGLE_GEMINI_API_KEY is set correctly
- [ ] Check Gemini API quota/billing at https://aistudio.google.com/
- [ ] Review server logs for API errors

## Security Reminders
- [ ] Never commit `.env` files
- [ ] Keep JWT_SECRET secure
- [ ] Monitor API usage regularly
- [ ] Use different secrets for production vs development

## Cost Monitoring
- [ ] Railway: Check usage doesn't exceed $5/month free credit
- [ ] Render: Monitor to stay within 750 hours/month
- [ ] Gemini API: Watch request volume (free tier has limits)

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- See DEPLOYMENT.md for detailed instructions

# SnackSecure Deployment Guide

This guide will help you deploy SnackSecure to Railway or Render for public access.

## Prerequisites

- GitHub account
- Railway or Render account (free tier available)
- Google Gemini API key

## Quick Deployment with Railway (Recommended)

### Step 1: Prepare Your Code

1. Initialize Git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - prepare for deployment"
   ```

2. Create a GitHub repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/snacksecure.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in with GitHub

2. Click **"New Project"** → **"Deploy from GitHub repo"**

3. Select your `snacksecure` repository

4. Railway will auto-detect the Node.js project and start building

### Step 3: Configure Environment Variables

1. In your Railway project dashboard, go to **Variables**

2. Add the following environment variables:

   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<your-generated-secret>
   GOOGLE_GEMINI_API_KEY=<your-gemini-api-key>
   ```

3. To generate a secure JWT secret, run locally:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 4: Access Your Application

1. Railway will provide a URL like: `https://snacksecure-production.up.railway.app`

2. Click on the deployment URL to access your app

3. Share this URL with your friends!

## Alternative: Deploy to Render

### Step 1-2: Same as Railway (GitHub setup)

### Step 3: Deploy to Render

1. Go to [Render](https://render.com) and sign in

2. Click **"New"** → **"Web Service"**

3. Connect your GitHub repository

4. Configure the service:
   - **Name**: snacksecure
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 4: Add Environment Variables

In the Render dashboard, add:
- `NODE_ENV` = `production`
- `JWT_SECRET` = (generate using the command above)
- `GOOGLE_GEMINI_API_KEY` = (your API key)

### Step 5: Deploy

Click **"Create Web Service"** and Render will deploy your app.

## Local Production Build Test

Before deploying, test the production build locally:

```bash
# Build both client and server
npm run build

# Set environment variables and start server
cd server
PORT=3001 NODE_ENV=production JWT_SECRET=test GOOGLE_GEMINI_API_KEY=your_key npm start
```

Open `http://localhost:3001` and verify:
- Frontend loads correctly
- API calls work
- Image upload and AI analysis function

## Post-Deployment Testing

After deployment, verify:

1. **Registration**: Create a new user account
2. **Manual Assessment**: Fill out a manual assessment form
3. **AI Analysis**: Upload a snack packaging image
4. **Language Toggle**: Switch between English and Chinese
5. **History**: Verify assessments are saved and retrievable
6. **Multi-User**: Have a friend register and test (data should be isolated)

## Monitoring

### Railway
- View logs in the **Deployments** tab
- Monitor resource usage in the **Metrics** tab

### Render
- View logs in the **Logs** tab
- Check deployment status in the **Events** tab

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Review build logs for specific errors

### API Calls Fail
- Verify environment variables are set correctly
- Check that `NODE_ENV=production` is set
- Review server logs for errors

### Database Issues
- Database will auto-create on first run
- Data persists on the hosting platform's disk
- For critical data, consider regular backups

## Costs

- **Railway**: Free $5/month credit (sufficient for hobby projects)
- **Render**: Free tier with 750 hours/month (note: may have cold starts)

## Updating Your Deployment

Both Railway and Render support automatic deployments:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Railway/Render will automatically detect the push and redeploy

## Security Notes

- Keep your JWT_SECRET secure and never commit it to Git
- Regularly rotate your API keys
- Monitor your Gemini API usage to avoid unexpected charges
- The `.gitignore` already excludes `.env` files and `*.sqlite` databases

## Need Help?

If you encounter issues:
1. Check the logs in your hosting platform dashboard
2. Verify all environment variables are set correctly
3. Test the production build locally first
4. Review the error messages in the console

Happy deploying! 🚀

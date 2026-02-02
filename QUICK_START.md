# SnackSecure - Quick Start Guide

## 🚀 Deploy to Production in 3 Steps

### Step 1: Test Locally (5 minutes)

```bash
# Build the application
npm run build

# Test production build locally
./test-production.sh
```

Visit `http://localhost:3001` and verify everything works.

### Step 2: Push to GitHub (2 minutes)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create repo at https://github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/snacksecure.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Railway (5 minutes)

1. Go to **https://railway.app** → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `snacksecure` repository
4. Go to **Variables** tab and add:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=<paste-generated-secret-below>
GOOGLE_GEMINI_API_KEY=<your-gemini-api-key>
```

5. Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Get your deployment URL and share with friends! 🎉

---

## 📚 Need More Details?

- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Summary**: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)

## ⚡ Environment Variables

| Variable | Where to Get It |
|----------|-----------------|
| `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `GOOGLE_GEMINI_API_KEY` | Get free key at: https://aistudio.google.com/apikey |

## ✅ Post-Deployment Testing

After deployment, test these features:

1. ✅ Register a new user
2. ✅ Create manual assessment
3. ✅ Upload snack image for AI analysis
4. ✅ Switch language (EN ↔ ZH)
5. ✅ View assessment history

## 💰 Costs

- **Railway**: FREE ($5/month credit)
- **Render**: FREE (750 hours/month)
- **Gemini API**: FREE tier available

## 🆘 Troubleshooting

**Build fails?**
- Run `npm run build` locally first
- Check all dependencies are installed

**API not working?**
- Verify `NODE_ENV=production` is set
- Check all environment variables are configured

**AI analysis fails?**
- Verify `GOOGLE_GEMINI_API_KEY` is correct
- Check API quota at https://aistudio.google.com/

---

**Estimated Total Time**: ~15 minutes from start to deployed app 🚀

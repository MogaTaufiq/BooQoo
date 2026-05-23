# 🚀 CI/CD Setup Guide - BooQoo

**Last Updated:** 2026-05-23  
**Status:** Ready to Configure

---

## 📋 Overview

BooQoo menggunakan **GitHub Actions** untuk CI/CD pipeline dengan dua workflow utama:

1. **`ci.yml`** - Continuous Integration (auto-run on push/PR)
2. **`deploy.yml`** - Manual deployment (production/staging)

---

## ✅ CI/CD Pipeline

### Pipeline Architecture

```
┌─────────────────────────────────────────────┐
│   Push/PR to main/develop                   │
└──────────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Lint & Type Check   │  ← ESLint + TypeScript
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Build Application   │  ← npm run build
    └──────────┬───────────┘
               │
               ├─────────────┬────────────────┐
               ▼             ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Security    │ │  Migration   │ │  E2E Tests   │
    │  Audit       │ │  Check       │ │  (Future)    │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           └────────────────┴────────────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │  Deploy (main only)  │  ← Production
                  └──────────────────────┘
```

---

## 🔧 Setup Instructions

### 1. Configure GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### Required Secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NEXTAUTH_SECRET` | NextAuth encryption key | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://booqoo.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `VERCEL_TOKEN` | Vercel deployment token | Get from Vercel dashboard |
| `VERCEL_ORG_ID` | Vercel organization ID | Get from Vercel settings |
| `VERCEL_PROJECT_ID` | Vercel project ID | Get from Vercel project |
| `APP_URL` | Application URL | `https://booqoo.vercel.app` |

#### Optional Secrets (Future):

| Secret Name | Description |
|-------------|-------------|
| `SENTRY_DSN` | Error monitoring |
| `SLACK_WEBHOOK` | Deployment notifications |

---

### 2. Generate Secrets

**NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**VERCEL_TOKEN:**
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy and add to GitHub secrets

**VERCEL_ORG_ID & VERCEL_PROJECT_ID:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel link

# Get IDs from .vercel/project.json
cat .vercel/project.json
```

---

### 3. Configure Database (Production)

**Recommended:** [Railway](https://railway.app) or [Neon](https://neon.tech)

**Railway Setup:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create PostgreSQL database
railway add

# Get connection string
railway variables
```

**Connection String Format:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

---

### 4. Enable GitHub Actions

1. Go to **Actions** tab in GitHub
2. Click "I understand my workflows, go ahead and enable them"
3. Workflows will auto-run on next push

---

## 📊 CI Workflow Details

### `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull Request to `main` or `develop`

**Jobs:**

#### 1. Lint & Type Check
```yaml
- ESLint validation
- TypeScript compilation check
- Fails on any error
```

#### 2. Build Application
```yaml
- Install dependencies
- Build Next.js app
- Upload build artifacts
```

#### 3. Security Audit
```yaml
- Run npm audit
- Check for high/critical vulnerabilities
- Generate audit report
```

#### 4. Migration Check
```yaml
- Start PostgreSQL test database
- Run Prisma migrations
- Validate schema
```

#### 5. Deploy (main branch only)
```yaml
- Download build artifacts
- Deploy to Vercel
- Notify success
```

---

## 🚀 Deployment Workflow

### `.github/workflows/deploy.yml`

**Trigger:** Manual (workflow_dispatch)

**How to Deploy:**
1. Go to **Actions** tab
2. Click "Production Deployment"
3. Click "Run workflow"
4. Select environment (production/staging)
5. Click "Run workflow"

**Steps:**
```
1. Checkout code
2. Type check
3. Build application
4. Deploy to Vercel
5. Run migrations
6. Health check
7. Notify success
```

---

## 🧪 Local Testing (Before Push)

```bash
# 1. Lint
npm run lint

# 2. Type check
npm run type-check

# 3. Build
npm run build

# 4. Test migrations
npx prisma db push

# 5. Run production build
npm start
```

**All must pass before pushing!**

---

## 📈 Monitoring CI/CD

### GitHub Actions Dashboard

**View Status:**
```
Repository → Actions tab
```

**Check Logs:**
```
Actions → Select workflow → Click on run → View job logs
```

**Re-run Failed Job:**
```
Click on failed job → Re-run jobs → Re-run failed jobs
```

---

## 🔍 Troubleshooting

### Common Issues:

#### 1. Type Check Fails
```bash
# Fix locally
npm run type-check

# Fix errors, then push
git add .
git commit -m "fix: TypeScript errors"
git push
```

#### 2. Build Fails
```bash
# Check build locally
npm run build

# Check environment variables
# Make sure all required env vars in GitHub Secrets
```

#### 3. Migration Fails
```bash
# Validate schema locally
npx prisma validate

# Check DATABASE_URL secret is correct
```

#### 4. Deployment Fails
```bash
# Check Vercel secrets:
# - VERCEL_TOKEN
# - VERCEL_ORG_ID
# - VERCEL_PROJECT_ID

# Verify manually:
npx vercel --prod
```

---

## 📊 Success Criteria

**CI Pipeline:**
- ✅ All jobs pass (green checkmarks)
- ✅ No TypeScript errors
- ✅ Build completes successfully
- ✅ Security audit has no critical issues
- ✅ Migrations apply cleanly

**Deployment:**
- ✅ Application deployed to Vercel
- ✅ Database migrations applied
- ✅ Health check passes
- ✅ Site accessible at production URL

---

## 🎯 Branch Protection (Recommended)

### Setup Branch Protection Rules:

1. Go to **Settings → Branches**
2. Click "Add rule"
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require status checks before merging
   - ✅ Require branches to be up to date
   - ✅ Status checks: `lint-and-typecheck`, `build`
   - ✅ Require pull request before merging
5. Save

**Result:** Cannot merge to `main` unless CI passes!

---

## 🚀 Deployment Environments

### Production
- **Branch:** `main`
- **URL:** https://booqoo.vercel.app (your domain)
- **Database:** Production PostgreSQL
- **Auto-deploy:** ✅ Yes (on push to main)

### Staging (Optional)
- **Branch:** `develop`
- **URL:** https://booqoo-staging.vercel.app
- **Database:** Staging PostgreSQL
- **Auto-deploy:** ✅ Yes (on push to develop)

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] All CI jobs passing
- [ ] No TypeScript errors
- [ ] Manual testing complete
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Backup database (if applicable)
- [ ] Monitor logs after deployment

---

## 🔄 Rollback Strategy

If deployment fails:

```bash
# Option 1: Revert commit
git revert <commit-hash>
git push

# Option 2: Rollback in Vercel
# Go to Vercel → Deployments → Select previous → Promote to Production

# Option 3: Redeploy previous version
git checkout <previous-commit>
git push -f origin main  # ⚠️ Use with caution
```

---

## 📊 Metrics to Monitor

### CI/CD Metrics:
- Build time (target: < 5 min)
- Test pass rate (target: 100%)
- Deployment frequency (daily/weekly)
- Mean time to recovery (< 1 hour)

### Application Metrics (Post-Deploy):
- Error rate (target: < 1%)
- Response time (target: < 500ms)
- Uptime (target: 99.9%)

---

## 🔮 Future Enhancements

### Phase 1 (Next Sprint):
- [ ] Add E2E tests (Playwright)
- [ ] Add unit tests (Jest)
- [ ] Code coverage reports
- [ ] Performance testing (Lighthouse CI)

### Phase 2:
- [ ] Staging environment
- [ ] Preview deployments (per PR)
- [ ] Automated rollback on errors
- [ ] Slack/Discord notifications
- [ ] Sentry error monitoring

### Phase 3:
- [ ] Blue-green deployments
- [ ] Canary releases
- [ ] Load testing
- [ ] Database backup automation

---

## 📚 Resources

**Documentation:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

**Tools:**
- [Railway](https://railway.app) - PostgreSQL hosting
- [Vercel](https://vercel.com) - Next.js hosting
- [Neon](https://neon.tech) - Serverless PostgreSQL

---

## ✅ Final Checklist

Before going to production:

**CI/CD:**
- [ ] GitHub secrets configured
- [ ] CI workflow tested
- [ ] Deploy workflow tested
- [ ] Branch protection enabled

**Infrastructure:**
- [ ] Production database setup
- [ ] Database backups configured
- [ ] Domain configured (if applicable)
- [ ] SSL certificate active

**Monitoring:**
- [ ] Error tracking (Sentry) - optional
- [ ] Uptime monitoring - optional
- [ ] Log aggregation - optional

**Documentation:**
- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] Rollback procedure tested

---

**Status:** ✅ CI/CD Ready to Configure  
**Last Updated:** 2026-05-23  
**Maintained By:** DevOps Team

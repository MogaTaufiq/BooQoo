# ⚠️ Warnings Explained - BooQoo Project

**Date:** 2026-05-24  
**Status:** Non-Critical (Safe to Ignore untuk sekarang)

---

## 🟡 GitHub Actions Warnings

### Warning: Node.js 20 is deprecated

**Full Message:**
```
Node.js 20 is deprecated. The following actions target Node.js 20 but are being 
forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4
```

**What It Means:**
- GitHub Actions internal runner pakai Node.js 20
- GitHub otomatis upgrade ke Node.js 24
- Warning muncul tapi build tetap jalan

**Impact:** ❌ NONE (Build still succeeds)

**Fixed In:** Commit updating actions to v6 (Node.js 24 native)
```yaml
# Old:
uses: actions/checkout@v4
uses: actions/setup-node@v4

# New:
uses: actions/checkout@v6  # ✅ Node.js 24 support
uses: actions/setup-node@v6  # ✅ Node.js 24 support
```

---

## 🟡 NPM Warnings During Build

### 1. Deprecation Warnings

**Common Examples:**
```bash
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory
npm warn deprecated glob@7.2.3: Old versions of glob are not supported
npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema
npm warn deprecated eslint@8.57.1: This version is no longer supported
```

**Why:**
- Dependencies (atau dependencies of dependencies) pakai package lama
- Package maintainers sudah release versi baru
- Old versions masih berfungsi, tapi tidak di-maintain lagi

**Impact:**
- ❌ **NO impact** pada functionality
- ⚠️ **Potential** security issues di masa depan
- ⚠️ **Potential** bugs tidak akan di-fix

**How to Fix:**
```bash
# Check outdated packages
npm outdated

# Update all (safe)
npm update

# Update major versions (BE CAREFUL!)
npm update <package-name>@latest

# Or edit package.json manually
```

**Recommendation:**
- ✅ **Safe untuk sekarang** - app still works perfectly
- ⏰ **Fix nanti** after beta deployment success
- 📅 **Plan update** before production

---

### 2. Security Vulnerabilities

**Common Message:**
```bash
18 vulnerabilities (8 moderate, 10 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
```

**Why:**
- Some dependencies have known security issues
- CVE (Common Vulnerabilities and Exposures) published
- Package maintainers released patches

**Check Details:**
```bash
npm audit

# Example output:
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ moderate      │ Prototype Pollution in lodash                                 │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Package       │ lodash                                                        │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Patched in    │ >=4.17.21                                                     │
├───────────────┼──────────────────────────────────────────────────────────────┤
│ Path          │ next > lodash                                                 │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

**Fix Options:**

**Option 1: Safe Fix (Recommended)**
```bash
npm audit fix

# This will:
# ✅ Update packages to safe versions
# ✅ Keep compatibility (semver ranges)
# ❌ Won't fix all vulnerabilities
```

**Option 2: Force Fix (Risky)**
```bash
npm audit fix --force

# This will:
# ✅ Fix ALL vulnerabilities
# ⚠️ May break compatibility
# ⚠️ May need code changes
# ⚠️ Need full testing after
```

**Option 3: Ignore (For Production Dependencies)**
```bash
# If vulnerability is in devDependencies only:
npm audit --production

# If it's in unused code path:
# → Safe to ignore
```

**Our Situation:**
```
18 vulnerabilities (8 moderate, 10 high)

Mostly from:
- eslint (devDependency - not in production)
- glob, rimraf (build tools - not in production)
- Some transitive dependencies from Next.js
```

**Impact:**
- ❌ **LOW** - Most are devDependencies
- ❌ **LOW** - Not exposed to users
- ⚠️ **Medium** - Should fix before production

**Recommendation:**
1. ✅ **Now:** Ignore (not blocking)
2. ⏰ **After Beta:** Run `npm audit fix`
3. 📅 **Before Prod:** Run `npm audit fix --force` + full test

---

### 3. Peer Dependency Warnings

**Example:**
```bash
npm warn ERESOLVE overriding peer dependency
npm warn Found: react@18.2.0
npm warn   peer react@"^18.0.0" from next@14.2.35
```

**Why:**
- Package A requires React 18.x
- Package B requires React 17.x
- npm picks one version (usually newer)

**Impact:**
- ❌ **Usually NO impact** - npm handles it
- ⚠️ **Rarely** - some features might not work

**Fix:**
```bash
# Usually auto-resolved, no action needed

# If breaking:
npm install react@<specific-version>
```

---

### 4. npm Notice - New Version Available

**Example:**
```bash
npm notice
npm notice New major version of npm available! 10.8.2 -> 11.15.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.15.0
npm notice To update run: npm install -g npm@11.15.0
npm notice
```

**Why:**
- npm has newer version available
- Current version still works fine

**Impact:**
- ❌ **NONE** - purely informational
- ✅ **Nice to have** - newer features, bug fixes

**Fix:**
```bash
# Update npm globally (optional)
npm install -g npm@latest

# Or use Node.js built-in npm
# → No need to update
```

---

## 📊 Summary Table

| Warning Type | Critical? | Fix Now? | Impact |
|-------------|-----------|----------|--------|
| Node.js 20 deprecated | ❌ No | ✅ YES (done) | None |
| NPM deprecated packages | ❌ No | ⏰ Later | None now |
| Security vulnerabilities | ⚠️ Medium | ⏰ After Beta | Low (dev deps) |
| Peer dependencies | ❌ No | ❌ NO | Auto-resolved |
| npm version notice | ❌ No | ❌ NO | Informational |

---

## 🎯 Action Plan

### ✅ Phase 1: NOW (Done)
- Updated GitHub Actions to v6 (Node.js 24 support)
- All warnings documented

### ⏰ Phase 2: After Beta Deployment
```bash
# Safe updates
npm update
npm audit fix

# Test thoroughly
npm run dev
npm run build
npm run type-check
npm run lint
```

### 📅 Phase 3: Before Production
```bash
# Aggressive fix (if needed)
npm audit fix --force

# Full regression testing
# - All features
# - All pages
# - All integrations

# Update package.json if needed
# Commit & test again
```

---

## 💡 Best Practices

### 1. Regular Maintenance
```bash
# Weekly/Monthly:
npm outdated        # Check outdated packages
npm audit           # Check security issues
npm update          # Safe updates
```

### 2. Before Major Releases
```bash
# Full cleanup:
rm -rf node_modules package-lock.json
npm install
npm audit fix
npm test
```

### 3. Documentation
- Keep track of why packages are pinned
- Document breaking changes
- Update CHANGELOG.md

### 4. Automated Checks
```yaml
# Add to CI/CD:
- name: Check for vulnerabilities
  run: npm audit --production --audit-level=high
  continue-on-error: true  # Don't fail build, just warn
```

---

## 🔍 How to Investigate Specific Warning

**Step 1: Identify the warning**
```bash
npm run build 2>&1 | grep "warn"
```

**Step 2: Check details**
```bash
npm audit
npm outdated
npm ls <package-name>  # Check dependency tree
```

**Step 3: Research**
```bash
# Check package GitHub/npm page
# Read CHANGELOG
# Search for issues
```

**Step 4: Test fix**
```bash
# Create branch
git checkout -b fix/npm-warnings

# Try fix
npm update <package>

# Test
npm run dev
npm run build
npm run test

# Commit if works
git commit -m "fix: Update vulnerable packages"
```

---

## ❓ FAQ

**Q: Will warnings break my production app?**  
A: ❌ NO. Warnings ≠ Errors. App works fine.

**Q: Should I fix all warnings before deploying?**  
A: Not necessarily. Fix critical security issues, defer cosmetic warnings.

**Q: Why so many warnings in a new project?**  
A: Dependencies have their own dependencies (transitive deps). One package can bring dozens of sub-dependencies, each with potential warnings.

**Q: Can I hide warnings?**  
A: Yes, but not recommended:
```bash
npm install --no-audit --no-fund
# Or set in .npmrc
```

**Q: Are these warnings normal?**  
A: ✅ YES! Almost every Node.js project has some warnings. Ecosystem moves fast, packages deprecate often.

---

**Bottom Line:** 
- ✅ All warnings documented
- ✅ None are critical NOW
- ✅ App works perfectly
- ⏰ Plan to fix gradually
- 📅 Must fix before production

**Current Focus:** Deploy Beta → Get Feedback → Fix Warnings → Production

**Priority:** 🎯 User testing > Warning cleanup

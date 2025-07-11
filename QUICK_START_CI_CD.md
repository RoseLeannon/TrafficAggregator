# Quick Start: CI/CD Pipeline

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Test Locally
```bash
npm run ci
```

This runs:
- ✅ Linting (Solidity + TypeScript)
- ✅ Contract compilation
- ✅ Full test suite
- ✅ Coverage report

### Step 3: Setup GitHub Secrets (Optional)

Only needed for deployment and coverage:

**Required for Coverage**:
1. Go to https://codecov.io
2. Add your repository
3. Copy `CODECOV_TOKEN`
4. Add to GitHub: Settings → Secrets → Actions → New secret

**Required for Deployment** (optional):
- `VERCEL_TOKEN` - From Vercel dashboard
- `VERCEL_ORG_ID` - From Vercel project
- `VERCEL_PROJECT_ID` - From Vercel project
- `DEPLOYER_PRIVATE_KEY` - Your wallet key
- `SEPOLIA_RPC_URL` - Infura/Alchemy URL
- `ETHERSCAN_API_KEY` - From Etherscan

### Step 4: Push to GitHub
```bash
git add .
git commit -m "Add CI/CD pipeline"
git push
```

**That's it!** CI/CD runs automatically on every push. ✅

---

## 📝 Daily Commands

### Development
```bash
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix issues
npm test              # Run tests
npm run test:coverage # Generate coverage
```

### Deployment
```bash
# Frontend (automatic on main)
git push origin main

# Contracts (manual with tags)
git tag v1.0.0
git push origin v1.0.0
```

---

## 🎯 What Runs Automatically

### On Every Push/PR:
- ✅ Linting (Solhint + ESLint)
- ✅ Tests (Node.js 18.x + 20.x)
- ✅ Coverage report
- ✅ Gas report
- ✅ Contract size check
- ✅ Security audit
- ✅ Frontend build test

### On Push to Main:
- ✅ All above checks
- ✅ Deploy frontend to Vercel

### On Version Tag (v1.0.0):
- ✅ All above checks
- ✅ Deploy contracts to Sepolia
- ✅ Verify on Etherscan
- ✅ Create GitHub release

---

## 📊 View Results

### GitHub Actions
Go to: **Your Repo → Actions tab**

### Codecov
Go to: **https://codecov.io/gh/USERNAME/REPO**

### Vercel
Go to: **https://vercel.com/dashboard**

---

## 🔧 Troubleshooting

### Tests fail locally?
```bash
npm run clean
npm install
npm run compile
npm test
```

### Linting errors?
```bash
npm run lint:fix
```

### CI/CD fails on GitHub?
1. Check Actions tab for error logs
2. Verify secrets are set correctly
3. Run `npm run ci` locally first

---

## 📚 Full Documentation

See `CI_CD_SETUP.md` for complete documentation including:
- Detailed setup instructions
- All configuration options
- Troubleshooting guide
- Best practices

---

## ✅ Quick Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Test locally (`npm run ci`)
- [ ] Setup Codecov (optional)
- [ ] Add GitHub secrets (optional)
- [ ] Push to GitHub
- [ ] Check Actions tab
- [ ] ✅ CI/CD running!

---

**That's all you need to get started!** 🎉

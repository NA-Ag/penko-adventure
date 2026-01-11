# Creator's Portal Deployment Guide

This guide explains how to deploy the Creator's Portal infrastructure for accepting community content submissions.

## Architecture Overview

The Creator's Portal uses a serverless architecture to automate the entire content submission workflow:

```
User submits form → Vercel Serverless Function → GitHub API
                                                        ↓
                                                   Creates PR
                                                        ↓
                                              GitHub Actions validate
                                                        ↓
                                           Maintainer reviews & merges
                                                        ↓
                                              Auto-deploys to GitHub Pages
```

## Prerequisites

1. GitHub account with a repository for Penko
2. Vercel account (free tier is sufficient)
3. GitHub Personal Access Token with `repo` permissions

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Penko Creator Portal")
4. Select scope: **`repo`** (Full control of private repositories)
5. Click "Generate token"
6. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd /path/to/penko

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? **penko** (or your preferred name)
- Directory? **./** (press Enter)
- Override settings? **N**

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and login
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: public
5. Click "Deploy"

## Step 3: Configure Environment Variables

After deployment, add environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `GITHUB_TOKEN` | (your GitHub PAT from Step 1) | Production, Preview, Development |
| `GITHUB_REPO` | `username/penko` (your repo path) | Production, Preview, Development |

**Security Note**: Never commit these tokens to Git. They are only stored in Vercel's secure environment.

## Step 4: Enable GitHub Actions

The repository includes two GitHub Actions workflows:

### 1. Validation Workflow (`.github/workflows/validate-content-pack.yml`)

This workflow automatically runs when a PR is created that modifies community content packs. It:
- Validates JSON structure
- Checks required metadata fields
- Verifies language codes, genres, and difficulty levels
- Posts validation results as a comment on the PR
- Blocks merge if validation fails

**No configuration needed** - this works automatically.

### 2. Deployment Workflow (`.github/workflows/deploy-content.yml`)

This workflow runs when a PR is merged to `main`. It:
- Updates the community content index
- Deploys to GitHub Pages
- Notifies the contributor

To enable GitHub Pages deployment:

1. Go to your GitHub repository
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **gh-pages** / **(root)**
5. Click Save

## Step 5: Test the Creator's Portal

1. Visit your Creator's Portal at:
   - Vercel URL: `https://your-project.vercel.app/creator-portal/`
   - GitHub Pages: `https://username.github.io/penko/creator-portal/`

2. Fill out the form with test data
3. Click "Submit for Review"
4. Check that:
   - A Pull Request is created in your repository
   - GitHub Actions runs validation
   - Validation results are posted as a comment

## Step 6: Customize (Optional)

### Update API URL

If your Vercel deployment URL is different, update the API URL in `public/creator-portal/index.html`:

```javascript
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api/submit-content'
  : 'https://your-custom-domain.vercel.app/api/submit-content';
```

### Customize Validation Rules

Edit `scripts/validate-content-pack.js` to add custom validation rules:

```javascript
// Example: Add custom genre
const VALID_GENRES = [
  'fantasy', 'scifi', 'mystery', 'adventure',
  'historical', 'contemporary', 'horror', 'comedy',
  'custom-genre'  // Add your genre here
];

// Example: Add keyword filter
const inappropriateKeywords = ['explicit', 'adult', 'nsfw', 'your-keyword'];
```

## Troubleshooting

### PR Creation Fails

**Error**: "Failed to create Pull Request"

**Solutions**:
- Verify `GITHUB_TOKEN` is valid and has `repo` scope
- Verify `GITHUB_REPO` is in format `owner/repo-name`
- Check token hasn't expired
- Ensure the repository exists and token has access

### Validation Workflow Doesn't Run

**Solutions**:
- Ensure PR modifies files in `public/content-packs/community/`
- Check GitHub Actions is enabled in repository settings
- Review workflow syntax in `.github/workflows/validate-content-pack.yml`

### Deployment Workflow Doesn't Deploy

**Solutions**:
- Ensure GitHub Pages is enabled (Step 4)
- Check that `gh-pages` branch exists
- Verify workflow has write permissions (Settings → Actions → General → Workflow permissions)

### CORS Errors in Browser

**Solutions**:
- Verify `vercel.json` includes correct CORS headers
- Ensure API route is accessible at `/api/submit-content`
- Check browser console for specific error messages

## Maintenance

### Reviewing Submissions

When a community member submits content:

1. GitHub automatically creates a PR
2. Automated validation runs
3. Review the validation results in the PR comments
4. Manually review content for:
   - Quality and originality
   - Appropriate language
   - Educational value
   - Grammar and spelling
5. If approved, merge the PR
6. Content automatically deploys to GitHub Pages

### Updating Content Pack Index

The index is automatically updated by the deployment workflow. To manually update:

```bash
node scripts/update-content-index.js
git add public/content-packs/community/index.json
git commit -m "Update content index"
git push
```

## Cost Breakdown

All services used are **FREE**:

- **Vercel**: Free tier includes 100GB bandwidth/month, unlimited deployments
- **GitHub**: Free for public repositories, includes Actions minutes
- **GitHub Pages**: Free for public repositories

## Security Considerations

1. **Never expose GitHub token**: Always use environment variables
2. **Validate all inputs**: Validation script checks for malicious content
3. **Review before merge**: Manual review is the final safety check
4. **Rate limiting**: Consider adding rate limiting to the API endpoint if needed
5. **Content moderation**: Review all submissions for inappropriate content

## Support

If you encounter issues:

1. Check Vercel deployment logs: Dashboard → Deployments → (select deployment) → Functions
2. Check GitHub Actions logs: Actions tab → (select workflow run)
3. Review validation output in PR comments
4. Test locally first: `vercel dev` to run serverless functions locally

## Next Steps

- Customize the Creator's Portal UI to match your branding
- Add more validation rules specific to your content requirements
- Set up email notifications for new submissions
- Create content guidelines for contributors
- Build a content pack browser for users to discover community content

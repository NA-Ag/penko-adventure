/**
 * Vercel Serverless Function - Content Pack Submission
 *
 * This function receives content pack submissions from the Creator's Portal
 * and creates a Pull Request on GitHub automatically.
 *
 * Environment Variables Required:
 * - GITHUB_TOKEN: Personal Access Token with repo permissions
 * - GITHUB_REPO: Repository name (e.g., "username/penko")
 *
 * Deploy to Vercel:
 * 1. vercel --prod
 * 2. Add environment variables in Vercel dashboard
 */

const { Octokit } = require('@octokit/rest');

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ...corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      ...corsHeaders
    });
  }

  try {
    // Parse submission data
    const { metadata, world, submitterEmail } = req.body;

    // Validate required data
    if (!metadata || !metadata.title || !metadata.author) {
      return res.status(400).json({
        error: 'Missing required fields: metadata.title and metadata.author are required',
        ...corsHeaders
      });
    }

    // Initialize GitHub client
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = (process.env.GITHUB_REPO || '').split('/');

    if (!owner || !repo) {
      throw new Error('GITHUB_REPO environment variable not configured');
    }

    // Generate unique branch name
    const timestamp = Date.now();
    const sanitizedAuthor = metadata.author.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const branchName = `content-submission-${sanitizedAuthor}-${timestamp}`;

    // Generate filename
    const sanitizedTitle = metadata.title.en.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${sanitizedTitle}-${timestamp}.json`;
    const filePath = `public/content-packs/community/${fileName}`;

    // Build content pack JSON
    const contentPack = {
      metadata: {
        id: `community_${timestamp}`,
        ...metadata,
        submittedAt: new Date().toISOString(),
        submitterEmail: submitterEmail || 'anonymous',
        status: 'pending_review'
      },
      world: world || {
        startingLocationId: 'start',
        locations: [],
        objects: [],
        npcs: []
      }
    };

    // Get default branch
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo
    });
    const defaultBranch = repoData.default_branch;

    // Get SHA of default branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`
    });
    const baseSha = refData.object.sha;

    // Create new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha
    });

    // Create file in new branch
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Add community content: ${metadata.title.en}`,
      content: Buffer.from(JSON.stringify(contentPack, null, 2)).toString('base64'),
      branch: branchName
    });

    // Create Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: `✨ New Content Submission: ${metadata.title.en}`,
      head: branchName,
      base: defaultBranch,
      body: `## 🎨 Community Content Submission

### Content Pack Information
- **Title**: ${metadata.title.en} / ${Object.values(metadata.title)[1] || 'N/A'}
- **Author**: ${metadata.author}
- **Language**: ${metadata.supportedLanguage}
- **Genre**: ${metadata.genre}
- **Difficulty**: ${metadata.difficulty}

### Description
${metadata.description.en}

---

### Submitter
${submitterEmail ? `📧 ${submitterEmail}` : '👤 Anonymous'}

### Automated Checks
GitHub Actions will run automated validation shortly. Please review:
- [ ] Content quality
- [ ] Grammar and spelling
- [ ] Appropriate for all audiences
- [ ] Follows content guidelines

---

*This PR was automatically created via the Creator's Portal. 🚀*
`
    });

    // Success!
    return res.status(200).json({
      success: true,
      message: 'Content pack submitted successfully!',
      pullRequestUrl: pr.html_url,
      pullRequestNumber: pr.number,
      ...corsHeaders
    });

  } catch (error) {
    console.error('Submission error:', error);

    return res.status(500).json({
      error: 'Failed to submit content pack',
      message: error.message,
      ...corsHeaders
    });
  }
};

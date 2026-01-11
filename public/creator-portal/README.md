# Penko Creator's Portal

A web-based interface for community members to create and submit content packs without needing to know Git, GitHub, or JSON.

## Features

- **No Technical Knowledge Required**: Simple web form interface
- **Guided Creation Process**: Step-by-step tabs for metadata, locations, objects, and NPCs
- **Real-Time Preview**: See your content pack JSON as you type
- **Automated Submission**: One-click submission creates a Pull Request automatically
- **Multi-Language Support**: Create content in 12+ languages
- **Validation**: Client-side validation ensures all required fields are filled

## Usage

### For Content Creators

1. Visit the Creator's Portal at `/creator-portal/` or your deployed URL
2. Click "Start Creating"
3. Fill in the form sections:
   - **Basic Info**: Title, description, language, genre, difficulty
   - **Locations**: Add locations to your world (optional in v1)
   - **Objects**: Add interactive objects (optional in v1)
   - **NPCs**: Add non-player characters (optional in v1)
   - **Preview & Submit**: Review your content and submit
4. Click "Submit for Review"
5. You'll receive a link to your Pull Request on GitHub
6. Wait for automated validation and maintainer review
7. Once approved, your content goes live automatically!

### Form Fields

#### Basic Info (Required)

| Field | Description | Example |
|-------|-------------|---------|
| Title (English) | Name of your content pack in English | "The Enchanted Forest" |
| Title (Target Language) | Name in the language being taught | "El Bosque Encantado" |
| Author Name | Your name or pseudonym | "Jane Doe" |
| Email (Optional) | For notifications about your submission | jane@example.com |
| Target Language | Language being taught | Spanish |
| Genre | Type of adventure | Fantasy |
| Difficulty | Learner level (A1-C2) | Beginner (A1-A2) |
| Description (English) | What your content pack is about | "A magical adventure..." |
| Description (Target Language) | Description in target language | "Una aventura mágica..." |
| Tags (Optional) | Comma-separated keywords | magic, exploration, quests |

#### Advanced (Optional for v1)

- **Locations**: Define places in your world
- **Objects**: Add items players can interact with
- **NPCs**: Create characters players can talk to

Currently, these advanced features are placeholders. The initial submission creates a basic content pack structure that can be expanded later.

## Architecture

```
Creator's Portal (Frontend)
         ↓
Vercel Serverless Function (/api/submit-content)
         ↓
GitHub API (creates branch + PR)
         ↓
GitHub Actions (validates content)
         ↓
Maintainer Review
         ↓
Auto-Deploy to GitHub Pages
```

## Development

### Local Testing

To test the Creator's Portal locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run development server
vercel dev
```

Visit `http://localhost:3000/creator-portal/`

### Modify the Form

Edit `index.html` to:
- Add new form fields
- Change styling (CSS is embedded in `<style>` tags)
- Modify validation logic in the `validateAndSubmit()` function

### Update API Endpoint

The form calls `/api/submit-content`. To change the endpoint:

```javascript
// In index.html, around line 737
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api/submit-content'
  : 'https://your-domain.com/api/submit-content';
```

## Deployment

See the main [Deployment Guide](../../docs/creator-portal-deployment.md) for complete instructions.

Quick steps:

1. Create GitHub Personal Access Token
2. Deploy to Vercel: `vercel --prod`
3. Add environment variables in Vercel:
   - `GITHUB_TOKEN`
   - `GITHUB_REPO`
4. Enable GitHub Pages
5. Test submission

## Content Pack Structure

Submissions create this JSON structure:

```json
{
  "metadata": {
    "id": "community_1234567890",
    "title": {
      "en": "English Title",
      "es": "Título en Español"
    },
    "author": "Creator Name",
    "version": "1.0.0",
    "description": {
      "en": "Description in English",
      "es": "Descripción en Español"
    },
    "supportedLanguage": "es",
    "genre": "fantasy",
    "difficulty": "beginner",
    "estimatedDuration": "30-45 minutes",
    "tags": ["magic", "exploration"],
    "submittedAt": "2025-12-10T12:00:00Z",
    "submitterEmail": "creator@example.com",
    "status": "pending_review"
  },
  "world": {
    "startingLocationId": "location_1",
    "locations": [],
    "objects": [],
    "npcs": []
  }
}
```

## Validation

Submitted content packs are automatically validated for:

- **Required Fields**: Title, author, language, genre, difficulty, description
- **Language Codes**: Must be a valid ISO 639-1 code
- **Genre**: Must be from allowed list
- **Difficulty**: Must match CEFR levels
- **JSON Structure**: Must be valid JSON
- **File Size**: Warning if > 500KB

See `scripts/validate-content-pack.js` for validation logic.

## Customization

### Styling

The portal uses a purple gradient theme. To customize:

```css
/* In index.html <style> section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Change to your brand colors */
.hero {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### Supported Languages

To add a new language:

1. Add to dropdown in `index.html`:
```html
<option value="new-lang">New Language (Native Name)</option>
```

2. Add to validation script `scripts/validate-content-pack.js`:
```javascript
const VALID_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru',
  'zh', 'ja', 'ko', 'ar', 'nl', 'pl', 'new-lang'
];
```

### Genres

To add a new genre:

1. Add to dropdown in `index.html`
2. Add to validation script `VALID_GENRES` array

## Security

- **No server-side code execution**: All form processing is client-side
- **GitHub token secured**: Stored in Vercel environment variables, never exposed
- **Content validation**: Automated checks before merge
- **Manual review**: Maintainer approval required
- **Inappropriate content filter**: Keyword-based filtering in validation

## Troubleshooting

### Submission button does nothing

- Check browser console for errors
- Ensure all required fields are filled
- Verify API endpoint is accessible

### "Network error" message

- Check that Vercel is deployed and environment variables are set
- Verify CORS headers in `api/submit-content.js`
- Test API endpoint directly with curl:

```bash
curl -X POST https://your-deployment.vercel.app/api/submit-content \
  -H "Content-Type: application/json" \
  -d '{"metadata": {...}, "world": {...}}'
```

### Pull Request not created

- Check Vercel function logs
- Verify GitHub token has `repo` permissions
- Ensure repository exists and token has access

## Contributing

To improve the Creator's Portal:

1. Test your changes locally with `vercel dev`
2. Ensure the form still validates correctly
3. Test the full submission flow
4. Submit a PR with your improvements

## License

Part of the Penko project. See main repository for license information.

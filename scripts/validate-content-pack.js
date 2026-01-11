/**
 * Content Pack Validation Script
 *
 * Validates community-submitted content packs for:
 * - Required metadata fields
 * - Valid JSON structure
 * - Language code validity
 * - Difficulty level validity
 * - Genre validity
 * - World structure completeness
 *
 * Usage: node scripts/validate-content-pack.js <path-to-content-pack.json>
 */

const fs = require('fs');
const path = require('path');

// Validation configuration
const VALID_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru',
  'zh', 'ja', 'ko', 'ar', 'nl', 'pl'
];

const VALID_GENRES = [
  'fantasy', 'scifi', 'mystery', 'adventure',
  'historical', 'contemporary', 'horror', 'comedy'
];

const VALID_DIFFICULTIES = [
  'beginner', 'intermediate', 'advanced'
];

const REQUIRED_METADATA_FIELDS = [
  'id', 'title', 'author', 'version', 'description',
  'supportedLanguage', 'genre', 'difficulty'
];

const REQUIRED_WORLD_FIELDS = [
  'startingLocationId', 'locations'
];

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Main validation function
 */
function validateContentPack(filePath) {
  const errors = [];
  const warnings = [];

  try {
    // 1. Check file exists
    if (!fs.existsSync(filePath)) {
      errors.push({
        type: 'FILE_NOT_FOUND',
        message: `File not found: ${filePath}`,
        severity: 'error'
      });
      return { valid: false, errors, warnings };
    }

    // 2. Read and parse JSON
    let contentPack;
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      contentPack = JSON.parse(fileContent);
    } catch (parseError) {
      errors.push({
        type: 'INVALID_JSON',
        message: `Failed to parse JSON: ${parseError.message}`,
        severity: 'error'
      });
      return { valid: false, errors, warnings };
    }

    // 3. Validate metadata exists
    if (!contentPack.metadata) {
      errors.push({
        type: 'MISSING_METADATA',
        message: 'Content pack must have a "metadata" field',
        severity: 'error'
      });
      return { valid: false, errors, warnings };
    }

    // 4. Validate required metadata fields
    REQUIRED_METADATA_FIELDS.forEach(field => {
      if (!contentPack.metadata[field]) {
        errors.push({
          type: 'MISSING_FIELD',
          field: `metadata.${field}`,
          message: `Required field missing: metadata.${field}`,
          severity: 'error'
        });
      }
    });

    // 5. Validate title structure (multilingual)
    if (contentPack.metadata.title) {
      if (typeof contentPack.metadata.title !== 'object') {
        errors.push({
          type: 'INVALID_STRUCTURE',
          field: 'metadata.title',
          message: 'Title must be an object with language keys (e.g., { "en": "...", "es": "..." })',
          severity: 'error'
        });
      } else {
        // Check if at least English and target language are present
        if (!contentPack.metadata.title.en) {
          errors.push({
            type: 'MISSING_TRANSLATION',
            field: 'metadata.title.en',
            message: 'English title (title.en) is required',
            severity: 'error'
          });
        }

        const targetLang = contentPack.metadata.supportedLanguage;
        if (targetLang && !contentPack.metadata.title[targetLang]) {
          errors.push({
            type: 'MISSING_TRANSLATION',
            field: `metadata.title.${targetLang}`,
            message: `Title in target language (${targetLang}) is required`,
            severity: 'error'
          });
        }
      }
    }

    // 6. Validate description structure (multilingual)
    if (contentPack.metadata.description) {
      if (typeof contentPack.metadata.description !== 'object') {
        errors.push({
          type: 'INVALID_STRUCTURE',
          field: 'metadata.description',
          message: 'Description must be an object with language keys',
          severity: 'error'
        });
      } else {
        if (!contentPack.metadata.description.en) {
          errors.push({
            type: 'MISSING_TRANSLATION',
            field: 'metadata.description.en',
            message: 'English description is required',
            severity: 'error'
          });
        }
      }
    }

    // 7. Validate supported language
    if (contentPack.metadata.supportedLanguage) {
      if (!VALID_LANGUAGES.includes(contentPack.metadata.supportedLanguage)) {
        errors.push({
          type: 'INVALID_VALUE',
          field: 'metadata.supportedLanguage',
          message: `Invalid language code: ${contentPack.metadata.supportedLanguage}. Must be one of: ${VALID_LANGUAGES.join(', ')}`,
          severity: 'error'
        });
      }
    }

    // 8. Validate genre
    if (contentPack.metadata.genre) {
      if (!VALID_GENRES.includes(contentPack.metadata.genre)) {
        errors.push({
          type: 'INVALID_VALUE',
          field: 'metadata.genre',
          message: `Invalid genre: ${contentPack.metadata.genre}. Must be one of: ${VALID_GENRES.join(', ')}`,
          severity: 'error'
        });
      }
    }

    // 9. Validate difficulty
    if (contentPack.metadata.difficulty) {
      if (!VALID_DIFFICULTIES.includes(contentPack.metadata.difficulty)) {
        errors.push({
          type: 'INVALID_VALUE',
          field: 'metadata.difficulty',
          message: `Invalid difficulty: ${contentPack.metadata.difficulty}. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
          severity: 'error'
        });
      }
    }

    // 10. Validate world structure
    if (!contentPack.world) {
      errors.push({
        type: 'MISSING_WORLD',
        message: 'Content pack must have a "world" field',
        severity: 'error'
      });
    } else {
      // Check required world fields
      REQUIRED_WORLD_FIELDS.forEach(field => {
        if (!contentPack.world[field]) {
          errors.push({
            type: 'MISSING_FIELD',
            field: `world.${field}`,
            message: `Required field missing: world.${field}`,
            severity: 'error'
          });
        }
      });

      // Validate locations array
      if (contentPack.world.locations) {
        if (!Array.isArray(contentPack.world.locations)) {
          errors.push({
            type: 'INVALID_TYPE',
            field: 'world.locations',
            message: 'world.locations must be an array',
            severity: 'error'
          });
        } else if (contentPack.world.locations.length === 0) {
          warnings.push({
            type: 'EMPTY_ARRAY',
            field: 'world.locations',
            message: 'Content pack has no locations defined',
            severity: 'warning'
          });
        } else {
          // Validate each location
          contentPack.world.locations.forEach((location, index) => {
            if (!location.id) {
              errors.push({
                type: 'MISSING_FIELD',
                field: `world.locations[${index}].id`,
                message: `Location at index ${index} is missing required "id" field`,
                severity: 'error'
              });
            }
            if (!location.text) {
              errors.push({
                type: 'MISSING_FIELD',
                field: `world.locations[${index}].text`,
                message: `Location "${location.id || index}" is missing required "text" field`,
                severity: 'error'
              });
            }
          });

          // Validate startingLocationId exists in locations
          if (contentPack.world.startingLocationId) {
            const locationIds = contentPack.world.locations.map(loc => loc.id);
            if (!locationIds.includes(contentPack.world.startingLocationId)) {
              errors.push({
                type: 'INVALID_REFERENCE',
                field: 'world.startingLocationId',
                message: `Starting location "${contentPack.world.startingLocationId}" not found in locations array`,
                severity: 'error'
              });
            }
          }
        }
      }
    }

    // 11. Check for inappropriate content (basic keyword filter)
    const inappropriateKeywords = ['explicit', 'adult', 'nsfw']; // Add more as needed
    const contentString = JSON.stringify(contentPack).toLowerCase();
    inappropriateKeywords.forEach(keyword => {
      if (contentString.includes(keyword)) {
        warnings.push({
          type: 'CONTENT_WARNING',
          message: `Content may contain inappropriate keyword: "${keyword}". Manual review recommended.`,
          severity: 'warning'
        });
      }
    });

    // 12. Validate version format (semver-ish)
    if (contentPack.metadata.version) {
      const versionPattern = /^\d+\.\d+\.\d+$/;
      if (!versionPattern.test(contentPack.metadata.version)) {
        warnings.push({
          type: 'INVALID_FORMAT',
          field: 'metadata.version',
          message: `Version should follow semantic versioning (e.g., "1.0.0"), got "${contentPack.metadata.version}"`,
          severity: 'warning'
        });
      }
    }

    // 13. Check file size (warn if > 500KB)
    const stats = fs.statSync(filePath);
    const fileSizeKB = stats.size / 1024;
    if (fileSizeKB > 500) {
      warnings.push({
        type: 'LARGE_FILE',
        message: `Content pack is ${fileSizeKB.toFixed(2)}KB. Consider optimizing if possible.`,
        severity: 'warning'
      });
    }

    // Determine overall validity
    const valid = errors.length === 0;

    return {
      valid,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        fileSize: `${fileSizeKB.toFixed(2)}KB`,
        locationCount: contentPack.world?.locations?.length || 0,
        npcCount: contentPack.world?.npcs?.length || 0,
        objectCount: contentPack.world?.objects?.length || 0
      }
    };

  } catch (error) {
    errors.push({
      type: 'UNEXPECTED_ERROR',
      message: `Unexpected validation error: ${error.message}`,
      severity: 'error'
    });
    return { valid: false, errors, warnings };
  }
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node validate-content-pack.js <path-to-content-pack.json>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  console.log(`\n🔍 Validating content pack: ${filePath}\n`);

  const result = validateContentPack(filePath);

  // Print errors
  if (result.errors.length > 0) {
    console.log('❌ ERRORS:\n');
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. [${error.type}] ${error.message}`);
      if (error.field) {
        console.log(`     Field: ${error.field}`);
      }
    });
    console.log('');
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    result.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. [${warning.type}] ${warning.message}`);
      if (warning.field) {
        console.log(`     Field: ${warning.field}`);
      }
    });
    console.log('');
  }

  // Print summary
  if (result.summary) {
    console.log('📊 SUMMARY:\n');
    console.log(`  Errors: ${result.summary.totalErrors}`);
    console.log(`  Warnings: ${result.summary.totalWarnings}`);
    console.log(`  File Size: ${result.summary.fileSize}`);
    console.log(`  Locations: ${result.summary.locationCount}`);
    console.log(`  NPCs: ${result.summary.npcCount}`);
    console.log(`  Objects: ${result.summary.objectCount}`);
    console.log('');
  }

  // Final verdict
  if (result.valid) {
    console.log('✅ Content pack is valid!\n');
    process.exit(0);
  } else {
    console.log('❌ Content pack validation failed.\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use in other scripts
module.exports = { validateContentPack };

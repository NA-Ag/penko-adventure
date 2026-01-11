#!/usr/bin/env node

/**
 * Extract StarDict dictionaries from .tar.xz archives
 * Outputs individual files (.ifo, .idx.gz, .dict.dz) for browser download
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const compressedDir = path.join(projectRoot, 'public', 'dictionaries', 'compressed');
const extractedDir = path.join(projectRoot, 'public', 'dictionaries', 'extracted');

// Ensure output directory exists
if (!fs.existsSync(extractedDir)) {
    fs.mkdirSync(extractedDir, { recursive: true });
}

// Get all .tar.xz files
const archives = fs.readdirSync(compressedDir).filter(f => f.endsWith('.tar.xz'));

console.log(`📚 Extracting ${archives.length} dictionaries...\n`);

for (const archive of archives) {
    const archivePath = path.join(compressedDir, archive);
    const dictName = archive.replace('.tar.xz', '');

    console.log(`Processing ${dictName}...`);

    // Create temp directory for extraction
    const tempDir = path.join(extractedDir, '.temp', dictName);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
        // Extract tar.xz
        execSync(`tar -xf "${archivePath}" -C "${tempDir}"`, { stdio: 'inherit' });

        // Find the actual dictionary files (they may be in a subdirectory)
        const files = [];
        const findFiles = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    findFiles(fullPath);
                } else if (entry.name.endsWith('.ifo') ||
                          entry.name.endsWith('.idx.gz') ||
                          entry.name.endsWith('.dict.dz')) {
                    files.push(fullPath);
                }
            }
        };
        findFiles(tempDir);

        // Create output directory for this dictionary
        const outputDir = path.join(extractedDir, dictName);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Copy dictionary files to output
        let copiedCount = 0;
        for (const file of files) {
            const filename = path.basename(file);
            const dest = path.join(outputDir, filename);
            fs.copyFileSync(file, dest);
            copiedCount++;
            console.log(`  ✓ ${filename} (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)`);
        }

        // Cleanup temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });

        console.log(`  ✅ ${copiedCount} files extracted\n`);

    } catch (error) {
        console.error(`  ❌ Error extracting ${dictName}:`, error.message);
        // Cleanup on error
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
}

// Cleanup temp directory
const tempRoot = path.join(extractedDir, '.temp');
if (fs.existsSync(tempRoot)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('✨ Dictionary extraction complete!');
console.log(`📁 Extracted files available at: ${extractedDir}`);

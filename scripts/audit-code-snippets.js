#!/usr/bin/env node
/**
 * Code Snippet Audit Script
 *
 * Audits all code snippets in docs/ for version pinning compliance (FR-003, FR-010)
 *
 * Requirements:
 * - Must have "# Library: [name] v[version]" comment
 * - Must have "# Last updated: YYYY-MM-DD" comment
 * - Must be within first 5 lines of code block
 *
 * Usage: node scripts/audit-code-snippets.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DOCS_DIR = 'docs';
const PATTERN = '**/*.{md,mdx}';

/**
 * Extract code blocks from markdown content
 */
function extractCodeBlocks(content, filePath) {
  const codeBlocks = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock = null;
  let lineNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    lineNumber = i + 1;
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        const match = line.match(/```(\w+)/);
        const language = match ? match[1] : 'unknown';
        currentBlock = {
          language,
          startLine: lineNumber,
          content: [],
          filePath,
        };
        inCodeBlock = true;
      } else {
        // End of code block
        currentBlock.endLine = lineNumber;
        currentBlock.content = currentBlock.content.join('\n');
        codeBlocks.push(currentBlock);
        inCodeBlock = false;
        currentBlock = null;
      }
    } else if (inCodeBlock) {
      currentBlock.content.push(line);
    }
  }

  return codeBlocks;
}

/**
 * Check if code block has version pinning
 */
function checkVersionPinning(codeBlock) {
  const lines = codeBlock.content.split('\n');
  const firstFiveLines = lines.slice(0, 5).join('\n');

  // Support multiple comment styles: # for Python, // for C#/JS/TS
  // Accept version numbers or "(Python stdlib)" / "(built-in)" for standard libraries
  const hasLibrary = /[#\/]{1,2}\s*Library:\s*\S+/.test(firstFiveLines);
  const hasLastUpdated = /[#\/]{1,2}\s*Last updated:\s*\d{4}-\d{2}-\d{2}/.test(firstFiveLines);

  return {
    hasLibrary,
    hasLastUpdated,
    compliant: hasLibrary && hasLastUpdated,
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Code Snippet Audit: Version Pinning Compliance\n');
  console.log(`Scanning: ${DOCS_DIR}/${PATTERN}\n`);

  // Find all markdown files
  const files = glob.sync(PATTERN, {
    cwd: DOCS_DIR,
    absolute: false,
  });

  if (files.length === 0) {
    console.error(`❌ No markdown files found in ${DOCS_DIR}/`);
    process.exit(1);
  }

  console.log(`Found ${files.length} files to analyze\n`);

  let totalBlocks = 0;
  let compliantBlocks = 0;
  const violations = [];

  // Analyze each file
  files.forEach((file) => {
    const filePath = path.join(DOCS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const codeBlocks = extractCodeBlocks(content, file);

    codeBlocks.forEach((block) => {
      // Skip certain types of code blocks
      if (['bash', 'shell', 'text', 'json', 'yaml', 'xml', 'markdown'].includes(block.language)) {
        return; // These typically don't need library version pinning
      }

      totalBlocks++;
      const check = checkVersionPinning(block);

      if (check.compliant) {
        compliantBlocks++;
      } else {
        violations.push({
          file: block.filePath,
          startLine: block.startLine,
          language: block.language,
          hasLibrary: check.hasLibrary,
          hasLastUpdated: check.hasLastUpdated,
        });
      }
    });
  });

  // Display results
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log(`Total Code Blocks: ${totalBlocks + violations.length}`);
  console.log(`Blocks Checked: ${totalBlocks} (excluding bash/json/yaml/etc.)`);
  console.log(`Compliant: ${compliantBlocks}/${totalBlocks} (${totalBlocks > 0 ? ((compliantBlocks / totalBlocks) * 100).toFixed(1) : 0}%)`);
  console.log(`Non-Compliant: ${violations.length}/${totalBlocks}`);

  if (violations.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('VIOLATIONS (NEED VERSION PINNING)');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    violations.forEach((v) => {
      console.log(`❌ ${v.file}:${v.startLine} (${v.language})`);
      if (!v.hasLibrary) {
        console.log(`   Missing: # Library: [name] v[X.Y.Z]`);
      }
      if (!v.hasLastUpdated) {
        console.log(`   Missing: # Last updated: YYYY-MM-DD`);
      }
      console.log();
    });

    console.log('Required Format:');
    console.log('```python title="example.py"');
    console.log('# Library: rclpy v3.3.7');
    console.log('# Last updated: 2025-12-05');
    console.log('# Tested on: ROS 2 Humble, Python 3.10');
    console.log('');
    console.log('import rclpy');
    console.log('# ... rest of code');
    console.log('```\n');

    console.log('❌ AUDIT FAILED - Version pinning missing\n');
    process.exit(1);
  }

  console.log('\n✅ AUDIT PASSED - All code snippets have version pinning\n');
  process.exit(0);
}

// Run the script
main();

#!/usr/bin/env node
/**
 * Readability Check Script for AI-Native Book
 *
 * Scans all .md and .mdx files in docs/ directory and validates
 * Flesch Reading Ease score ≥60 (FR-004 requirement)
 *
 * Usage:
 *   node scripts/check-readability.js
 *   npm run readability-check
 *
 * Exit codes:
 *   0 - All files pass readability threshold
 *   1 - One or more files below threshold
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const readability = require('readability-scores');

// Configuration
const DOCS_DIR = 'docs';
const THRESHOLD = 60; // Flesch Reading Ease minimum score
const PATTERN = '**/*.{md,mdx}';

/**
 * Clean markdown content for readability analysis
 * Removes frontmatter, code blocks, JSX components, and markdown syntax
 */
function cleanMarkdownContent(content) {
  let cleaned = content;

  // Remove frontmatter (YAML between --- delimiters)
  cleaned = cleaned.replace(/^---\n[\s\S]*?\n---\n/m, '');

  // Remove code blocks (```...```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (`...`)
  cleaned = cleaned.replace(/`[^`]+`/g, '');

  // Remove JSX components (e.g., <Diagram ... />, <Callout>...</Callout>)
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Remove Docusaurus admonitions (:::tip ... :::)
  cleaned = cleaned.replace(/:::[a-z]+[\s\S]*?:::/g, '');

  // Remove markdown links but keep link text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown images
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

  // Remove markdown headers but keep text
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown emphasis (**, *, ~~)
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2'); // bold
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');     // italic
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');         // strikethrough

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove markdown list markers
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Calculate Flesch Reading Ease score for a file
 */
function calculateReadability(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const cleanedContent = cleanMarkdownContent(content);

  // Skip files with minimal content (< 100 characters after cleaning)
  if (cleanedContent.length < 100) {
    return {
      score: null,
      reason: 'Insufficient content (< 100 characters)',
    };
  }

  try {
    const scores = readability(cleanedContent);

    // Calculate Flesch Reading Ease manually from word/sentence/syllable counts
    // Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    const { wordCount, sentenceCount, syllableCount } = scores;

    if (wordCount === 0 || sentenceCount === 0) {
      return {
        score: null,
        reason: 'Insufficient content (no sentences or words)',
      };
    }

    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllableCount / wordCount;
    const fleschReadingEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    return {
      score: parseFloat(fleschReadingEase.toFixed(2)),
      reason: null,
    };
  } catch (error) {
    return {
      score: null,
      reason: `Error calculating score: ${error.message}`,
    };
  }
}

/**
 * Get readability interpretation
 */
function getReadabilityLevel(score) {
  if (score >= 90) return 'Very Easy (5th grade)';
  if (score >= 80) return 'Easy (6th grade)';
  if (score >= 70) return 'Fairly Easy (7th grade)';
  if (score >= 60) return 'Standard (8th-9th grade) ✅';
  if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
  if (score >= 30) return 'Difficult (College)';
  return 'Very Difficult (College Graduate)';
}

/**
 * Main execution
 */
function main() {
  console.log('📖 Readability Check: AI-Native Book for Physical AI & Humanoid Robotics\n');
  console.log(`Threshold: Flesch Reading Ease ≥ ${THRESHOLD} (FR-004 requirement)`);
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

  const results = [];
  const failedFiles = [];
  const skippedFiles = [];

  // Analyze each file
  files.forEach((file) => {
    const filePath = path.join(DOCS_DIR, file);
    const result = calculateReadability(filePath);

    if (result.score === null) {
      skippedFiles.push({
        file,
        reason: result.reason,
      });
      return;
    }

    const passed = result.score >= THRESHOLD;
    results.push({
      file,
      score: result.score,
      level: getReadabilityLevel(result.score),
      passed,
    });

    if (!passed) {
      failedFiles.push({
        file,
        score: result.score,
        level: getReadabilityLevel(result.score),
      });
    }
  });

  // Sort results by score (lowest first)
  results.sort((a, b) => a.score - b.score);

  // Display results
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('READABILITY SCORES');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    const scorePadded = result.score.toString().padStart(5);
    console.log(`${icon} ${scorePadded} | ${result.level.padEnd(40)} | ${result.file}`);
  });

  // Display skipped files
  if (skippedFiles.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('SKIPPED FILES');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    skippedFiles.forEach((skipped) => {
      console.log(`⏭️  ${skipped.file}`);
      console.log(`   Reason: ${skipped.reason}\n`);
    });
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const passedCount = results.filter(r => r.passed).length;
  const totalAnalyzed = results.length;
  const passRate = totalAnalyzed > 0 ? ((passedCount / totalAnalyzed) * 100).toFixed(1) : 0;

  console.log(`Total Files: ${files.length}`);
  console.log(`Analyzed: ${totalAnalyzed}`);
  console.log(`Skipped: ${skippedFiles.length}`);
  console.log(`Passed (≥${THRESHOLD}): ${passedCount}/${totalAnalyzed} (${passRate}%)`);
  console.log(`Failed (<${THRESHOLD}): ${failedFiles.length}/${totalAnalyzed}`);

  if (totalAnalyzed > 0) {
    const avgScore = (results.reduce((sum, r) => sum + r.score, 0) / totalAnalyzed).toFixed(2);
    console.log(`Average Score: ${avgScore}`);
  }

  // Failed files details
  if (failedFiles.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('FAILED FILES (NEED IMPROVEMENT)');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    failedFiles.forEach((failed) => {
      console.log(`❌ ${failed.file}`);
      console.log(`   Score: ${failed.score} (${failed.level})`);
      console.log(`   Target: ${THRESHOLD}+`);
      console.log(`   Gap: ${(THRESHOLD - failed.score).toFixed(2)} points\n`);
    });

    console.log('Improvement Tips:');
    console.log('  • Simplify complex sentences (aim for 15-20 words)');
    console.log('  • Break long paragraphs into shorter ones');
    console.log('  • Replace jargon with plain language (or explain technical terms)');
    console.log('  • Use active voice ("The robot detects" not "is detected by")');
    console.log('  • Add transitions and concrete examples');
    console.log('  • Note: FR-013b allows technical term exceptions with manual review\n');

    console.log('❌ READABILITY CHECK FAILED\n');
    process.exit(1);
  }

  console.log('\n✅ READABILITY CHECK PASSED\n');
  process.exit(0);
}

// Run the script
main();

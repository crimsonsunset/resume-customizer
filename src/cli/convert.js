#!/usr/bin/env node

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { program } from 'commander';
import chalk from 'chalk';
import { chromium } from 'playwright';
import ResumeGenerator from '@shared/resume-generator.js';

const fsPromises = fs.promises;

const execAsync = promisify(exec);

/**
 * Create working copy of profile while preserving original
 * @param {string} originalPath - Path to original profile.json
 * @returns {string} Path to working copy
 */
async function createWorkingCopy(originalPath) {
  const workingPath = originalPath.replace('/profiles/', '/working/').replace('.json', '-working.json');
  
  // Ensure working directory exists
  const workingDir = path.dirname(workingPath);
  await fsPromises.mkdir(workingDir, { recursive: true });
  
  // Copy original to working if working doesn't exist
  try {
    await fsPromises.access(workingPath);
    console.log(chalk.yellow('📝 Using existing working copy:'), workingPath);
  } catch {
    await fsPromises.copyFile(originalPath, workingPath);
    console.log(chalk.green('📝 Created working copy:'), workingPath);
  }
  
  return workingPath;
}

/**
 * Check if pandoc is installed
 */
async function checkPandoc() {
  try {
    await execAsync('pandoc --version');
    return true;
  } catch {
    console.error(chalk.red('❌ Pandoc is not installed. Please install pandoc first:'));
    console.error(chalk.yellow('  macOS: brew install pandoc'));
    console.error(chalk.yellow('  Windows: https://pandoc.org/installing.html'));
    console.error(chalk.yellow('  Linux: sudo apt-get install pandoc'));
    return false;
  }
}

/**
 * Convert Word document to Markdown
 */
async function convertToMarkdown(inputFile, outputFile) {
  console.log(chalk.blue('🔄 Converting to markdown...'));
  
  const cmd = `pandoc "${inputFile}" -t markdown -o "${outputFile}" --wrap=none --reference-links --extract-media=media`;
  
  try {
    const { stdout: _stdout, stderr } = await execAsync(cmd);
    
    if (stderr) {
      console.warn(chalk.yellow('⚠️  Warnings:'), stderr);
    }
    
    console.log(chalk.green('✅ Conversion complete!'));
    console.log(chalk.gray('📄 Markdown file:'), outputFile);
    
    // Check if media folder was created
    try {
      await fsPromises.access('media');
      console.log(chalk.gray('🖼️  Media extracted to: media/'));
    } catch {
      // Media folder doesn't exist, that's fine
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Conversion failed:'), error.message);
    return false;
  }
}

/**
 * Convert Markdown to Word document
 */
async function convertToWord(inputFile, referenceFile, outputFile) {
  console.log(chalk.blue('🔄 Converting to Word...'));
  
  const cmd = `pandoc "${inputFile}" -o "${outputFile}" --reference-doc="${referenceFile}"`;
  
  try {
    const { stdout: _stdout, stderr } = await execAsync(cmd);
    
    if (stderr) {
      console.warn(chalk.yellow('⚠️  Warnings:'), stderr);
    }
    
    console.log(chalk.green('✅ Conversion complete!'));
    console.log(chalk.gray('📄 Word file:'), outputFile);
    console.log(chalk.gray('🎉 Your optimized resume is ready!'));
    
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Conversion failed:'), error.message);
    return false;
  }
}

/**
 * Get file info and suggest names
 */
function getFileInfo(filePath) {
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const dir = path.dirname(filePath);
  
  return { name, ext, dir };
}

/**
 * Convert HTML to PDF using Playwright (with CSS Grid support)
 */
async function convertHtmlToPdf(inputFile, outputFile, cssFile = null) {
  console.log(chalk.blue('🔄 Converting HTML to PDF with Playwright...'));
  
  try {
    // Read HTML content
    const htmlContent = await fsPromises.readFile(inputFile, 'utf8');
    const inputDir = path.dirname(inputFile);
    
    // Auto-detect and resolve CSS files from HTML <link> tags
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    const detectedCssFiles = [];
    let match;
    
    while ((match = linkRegex.exec(htmlContent)) !== null) {
      const cssPath = match[1];
      const resolvedPath = path.resolve(inputDir, cssPath);
      
      try {
        await fsPromises.access(resolvedPath);
        detectedCssFiles.push(resolvedPath);
        console.log(chalk.gray('🔗 Auto-detected CSS:'), cssPath);
      } catch {
        console.warn(chalk.yellow('⚠️  Could not resolve CSS file:'), cssPath);
      }
    }
    
    // Collect all CSS content (auto-detected + optional additional)
    const allCssContent = [];
    
    // Add auto-detected CSS files
    for (const cssPath of detectedCssFiles) {
      const cssContent = await fsPromises.readFile(cssPath, 'utf8');
      allCssContent.push(cssContent);
    }
    
    // Add optional additional CSS file
    if (cssFile) {
      const cssContent = await fsPromises.readFile(cssFile, 'utf8');
      allCssContent.push(cssContent);
      console.log(chalk.gray('➕ Additional CSS:'), cssFile);
    }
    
    // Process HTML with injected CSS
    let processedHtml = htmlContent;
    if (allCssContent.length > 0) {
      const combinedCss = allCssContent.join('\n\n');
      // Insert CSS before closing </head> tag or create head if doesn't exist
      processedHtml = processedHtml.includes('</head>') 
        ? processedHtml.replace('</head>', `<style>${combinedCss}</style></head>`)
        : processedHtml.replace('<html>', `<html><head><style>${combinedCss}</style></head>`);
    }
    
    // Launch Playwright browser
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set content and wait for rendering
    await page.setContent(processedHtml, { waitUntil: 'networkidle' });
    
    // Generate PDF with minimal margins for maximum content area
    await page.pdf({
      path: outputFile,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.1in',
        right: '0.1in',
        bottom: '0.1in',
        left: '0.1in'
      },
      // Enable CSS page size if specified in CSS
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    console.log(chalk.green('✅ PDF conversion complete!'));
    console.log(chalk.gray('📄 PDF file:'), outputFile);
    console.log(chalk.gray('🎉 Your resume PDF is ready!'));
    
    return true;
  } catch (error) {
    console.error(chalk.red('❌ PDF conversion failed:'), error.message);
    return false;
  }
}

// CLI Commands
program
  .name('resume-optimizer')
  .description('Convert resume documents for optimization workflow')
  .version('1.0.0');

program
  .command('to-markdown')
  .description('Convert Word document to Markdown')
  .argument('<input>', 'Input .docx file')
  .option('-o, --output <file>', 'Output markdown file')
  .action(async (input, options) => {
    if (!(await checkPandoc())) return;
    
    const { name } = getFileInfo(input);
    const output = options.output || `${name}.md`;
    
    console.log(chalk.blue('📝 Resume Optimizer - Word to Markdown'));
    console.log(chalk.gray('Input:'), input);
    console.log(chalk.gray('Output:'), output);
    console.log('');
    
    await convertToMarkdown(input, output);
  });

program
  .command('to-word')
  .description('Convert Markdown back to Word')
  .argument('<input>', 'Input .md file')
  .argument('<reference>', 'Reference .docx file for styling')
  .option('-o, --output <file>', 'Output Word file')
  .action(async (input, reference, options) => {
    if (!(await checkPandoc())) return;
    
    const { name } = getFileInfo(input);
    const output = options.output || `${name}_optimized.docx`;
    
    console.log(chalk.blue('📝 Resume Optimizer - Markdown to Word'));
    console.log(chalk.gray('Input:'), input);
    console.log(chalk.gray('Reference:'), reference);
    console.log(chalk.gray('Output:'), output);
    console.log('');
    
    await convertToWord(input, reference, output);
  });

program
  .command('setup')
  .description('Setup project folders')
  .action(async () => {
    console.log(chalk.blue('📁 Setting up project structure...'));
    
    const folders = ['input', 'working', 'output'];
    
    await Promise.all(folders.map(async (folder) => {
      try {
        await fsPromises.mkdir(folder, { recursive: true });
        console.log(chalk.green('✅'), `Created ${folder}/`);
      } catch {
        console.log(chalk.yellow('⚠️'), `${folder}/ already exists`);
      }
    }));
    
    console.log('');
    console.log(chalk.green('🎯 Project setup complete!'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('1. Put your resume.docx in input/'));
    console.log(chalk.gray('2. Run: npm run to-markdown input/resume.docx'));
    console.log(chalk.gray('3. Edit the .md file in working/'));
    console.log(chalk.gray('4. Run: npm run to-word working/resume.md input/resume.docx'));
  });

program
  .command('html-to-pdf')
  .description('Convert HTML file to PDF using Playwright (auto-detects CSS from <link> tags)')
  .argument('<input>', 'Input .html file')
  .option('-o, --output <file>', 'Output PDF file')
  .option('--css <file>', 'Additional CSS stylesheet (auto-detects existing <link> tags)')
  .action(async (input, options) => {
    const { name } = getFileInfo(input);
    const output = options.output || `output/${name}.pdf`;
    
    console.log(chalk.blue('📄 HTML to PDF Conversion (Playwright)'));
    console.log(chalk.gray('Input:'), input);
    console.log(chalk.gray('Output:'), output);
    if (options.css) {
      console.log(chalk.gray('Additional CSS:'), options.css);
    }
    console.log('');
    
    // Use Playwright for conversion
    await convertHtmlToPdf(input, output, options.css);
  });

// Add new command for JSON-to-HTML generation
program
  .command('json-to-html')
  .description('Generate HTML resume from profile.json')
  .option('-i, --input <file>', 'Input profile.json file', 'input/profiles/profile.json')
  .option('-o, --output <file>', 'Output HTML file', 'output/resume-from-json.html')
  .option('-v, --version <version>', 'Resume version (full|short|technical|leadership)', 'full')
  .option('-t, --template <template>', 'HTML template (modern|ats_friendly)', 'modern')
  .action(async (options) => {
    console.log('🎯 Generating HTML resume from profile.json...');
    
    try {
      // Create working copy to preserve original
      const workingInput = await createWorkingCopy(options.input);
      
      const generator = new ResumeGenerator(workingInput);
      const resumeData = generator.generateResume(options.version);
      const html = generator.generateHTML(resumeData, options.template);
      
      // Ensure output directory exists
      const outputDir = path.dirname(options.output);
          if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(options.output, html);
      console.log(`✅ Generated ${options.version} resume: ${options.output}`);
      console.log(`📊 Sections: ${Object.keys(resumeData.sections).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Error generating resume:', error.message);
      process.exit(1);
    }
  });

// Add command for JSON-to-PDF (combine JSON generation with PDF conversion)
program
  .command('json-to-pdf')
  .description('Generate PDF resume from profile.json')
  .option('-i, --input <file>', 'Input profile.json file', 'input/profiles/profile.json')
  .option('-o, --output <file>', 'Output PDF file', 'output/resume-from-json.pdf')
  .option('-v, --version <version>', 'Resume version (full|short|technical|leadership)', 'full')
  .option('-t, --template <template>', 'HTML template (modern|ats_friendly)', 'modern')
  .action(async (options) => {
    console.log('🎯 Generating PDF resume from profile.json...');
    
    try {
      // Create working copy to preserve original
      const workingInput = await createWorkingCopy(options.input);
      
      const generator = new ResumeGenerator(workingInput);
      const resumeData = generator.generateResume(options.version);
      const html = generator.generateHTML(resumeData, options.template);
      
      // Create temporary HTML file
      const tempHtml = 'temp-resume.html';
          fs.writeFileSync(tempHtml, html);
    
    // Ensure output directory exists
    const outputDir = path.dirname(options.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
      
      // Convert to PDF using Playwright
      console.log(`Converting ${tempHtml} to PDF...`);
      await convertHtmlToPdf(tempHtml, options.output);
      
      // Clean up temp file
      fs.unlinkSync(tempHtml);
      
      console.log(`✅ Generated ${options.version} resume PDF: ${options.output}`);
      console.log(`📊 Sections: ${Object.keys(resumeData.sections).join(', ')}`);
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error.message);
      process.exit(1);
    }
  });

// Add command to preview different resume versions
program
  .command('preview-versions')
  .description('Preview all resume versions without generating files')
  .option('-i, --input <file>', 'Input profile.json file', 'input/profiles/profile.json')
  .action(async (options) => {
    console.log('🎯 Previewing all resume versions...');
    
    try {
      // Create working copy to preserve original
      const workingInput = await createWorkingCopy(options.input);
      
      const generator = new ResumeGenerator(workingInput);
      const {profile} = generator;
      
      console.log('\n📋 Available Resume Versions:');
      for (const [key, config] of Object.entries(profile.resume_config.versions)) {
        console.log(`\n${key.toUpperCase()}:`);
        console.log(`  Name: ${config.name}`);
        console.log(`  Target Length: ${config.target_length || 'unlimited'}`);
        console.log(`  Section Order: ${config.section_order.join(' → ')}`);
        
        if (config.experience_limit) {
          console.log(`  Experience Limit: ${config.experience_limit}`);
        }
        if (config.projects_limit) {
          console.log(`  Projects Limit: ${config.projects_limit}`);
        }
        if (config.emphasis) {
          console.log(`  Emphasis: ${config.emphasis.join(', ')}`);
        }
        
        // Generate and show summary
        const resumeData = generator.generateResume(key);
        console.log(`  Generated: ${resumeData.sections.experience?.length || 0} experiences, ${resumeData.sections.projects?.length || 0} projects, ${resumeData.sections.skills?.length || 0} skills`);
      }
      
    } catch (error) {
      console.error('❌ Error previewing versions:', error.message);
      process.exit(1);
    }
  });

// Add command to create profile template
program
  .command('create-profile-template')
  .description('Create enhanced profile.json template with resume metadata')
  .option('-o, --output <file>', 'Output template file', 'profile-template.json')
  .action((options) => {
    console.log('🎯 Creating profile.json template...');
    
    try {
      const templatePath = 'input/profiles/profile-resume-schema.json';
      const template = fs.readFileSync(templatePath, 'utf8');
    
    fs.writeFileSync(options.output, template);
      console.log(`✅ Profile template created: ${options.output}`);
      console.log('📝 Edit this template to add your resume metadata');
      
    } catch (error) {
      console.error('❌ Error creating template:', error.message);
      process.exit(1);
    }
  });

program.parse();

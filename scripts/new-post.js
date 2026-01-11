#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get title from command line arguments
const args = process.argv.slice(2);
const title = args.join(' ');

if (!title) {
  console.error('Error: Please provide a post title');
  console.error('Usage: pnpm run new-post "Your Post Title"');
  process.exit(1);
}

// Generate slug from title
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const slug = slugify(title);
const currentDate = getCurrentDate();
const fileName = `${slug}.md`;
const filePath = path.join(__dirname, '..', 'src', 'posts', fileName);

// Check if file already exists
if (fs.existsSync(filePath)) {
  console.error(`Error: A post with this slug already exists: ${fileName}`);
  process.exit(1);
}

// Create post template
const template = `---
layout: post
title: ${title}
excerpt:
date: ${currentDate}
updatedDate: ${currentDate}
featuredImage:
draft: true
tags:
  - post
---

Write your post content here...
`;

// Write the file
try {
  fs.writeFileSync(filePath, template, 'utf8');
  console.log(`✅ New draft post created: src/posts/${fileName}`);
  console.log(`📝 Title: ${title}`);
  console.log(`📅 Date: ${currentDate}`);
  console.log(`\nYou can now edit the post at: src/posts/${fileName}`);
} catch (error) {
  console.error('Error creating post:', error.message);
  process.exit(1);
}

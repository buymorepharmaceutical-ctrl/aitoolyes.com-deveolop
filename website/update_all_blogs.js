const fs = require('fs');
const path = require('path');

const blogsPath = path.join(__dirname, 'src/data/blogs.ts');
let content = fs.readFileSync(blogsPath, 'utf-8');

function getEscapedContent(filename) {
  let md = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
  // Escape backticks and template string variables so it doesn't break the template literal in blogs.ts
  return md.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

const newContent1 = getEscapedContent('blog1.md');
const newContent2 = getEscapedContent('blog2.md');
const newContent3 = getEscapedContent('blog3.md');
const newContent4 = getEscapedContent('blog4.md');
const newContent5 = getEscapedContent('blog5.md');

function replaceContentForSlug(fileContent, slug, newContent) {
  const regex = new RegExp(`(slug:\\s*['"]${slug}['"][\\s\\S]*?content:\\s*\`)([\\s\\S]*?)(\`)`, 'g');
  return fileContent.replace(regex, `$1\n${newContent}\n    $3`);
}

content = replaceContentForSlug(content, 'how-to-build-a-modern-ai-agent-saas', newContent1);
content = replaceContentForSlug(content, 'best-practices-for-jwt-authentication', newContent2);
content = replaceContentForSlug(content, 'mastering-glassmorphism-in-tailwind-css', newContent3);
content = replaceContentForSlug(content, 'the-future-of-ai-in-content-creation', newContent4);
content = replaceContentForSlug(content, 'top-10-ai-tools-for-developers', newContent5);

fs.writeFileSync(blogsPath, content, 'utf-8');
console.log('Successfully updated and escaped all 5 blogs.');

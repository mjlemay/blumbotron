const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const outputPath = path.join(__dirname, '..', 'docs', 'changelog.html');

const markdown = fs.readFileSync(changelogPath, 'utf-8');

// Parse releases from markdown
const releases = [];
const versionRegex = /^###?\s+\[?([\d.]+)\]?\(?([^)]*)\)?\s*\((\d{4}-\d{2}-\d{2})\)/gm;
const lines = markdown.split('\n');

let currentRelease = null;
let currentSection = null;

for (const line of lines) {
  const versionMatch = line.match(/^###?\s+\[?([\d.]+)\]?\(?(https?:\/\/[^)]+)?\)?\s*\((\d{4}-\d{2}-\d{2})\)/);
  if (versionMatch) {
    if (currentRelease) releases.push(currentRelease);
    currentRelease = {
      version: versionMatch[1],
      compareUrl: versionMatch[2] || null,
      date: versionMatch[3],
      sections: []
    };
    currentSection = null;
    continue;
  }

  if (!currentRelease) continue;

  const sectionMatch = line.match(/^###\s+(.+)/);
  if (sectionMatch) {
    currentSection = { title: sectionMatch[1], items: [] };
    currentRelease.sections.push(currentSection);
    continue;
  }

  if (currentSection) {
    const itemMatch = line.match(/^\*\s+(.+)/);
    if (itemMatch) {
      let text = itemMatch[1];
      // Extract commit hash link if present
      let commitHash = null;
      let commitUrl = null;
      const commitMatch = text.match(/\(?\[([a-f0-9]+)\]\(([^)]+)\)\)?$/);
      if (commitMatch) {
        commitHash = commitMatch[1];
        commitUrl = commitMatch[2];
        text = text.replace(/\s*\(?\[([a-f0-9]+)\]\([^)]+\)\)?$/, '').trim();
      }
      currentSection.items.push({ text, commitHash, commitUrl });
    }
  }
}
if (currentRelease) releases.push(currentRelease);

// Map section titles to CSS classes
function sectionClass(title) {
  const lower = title.toLowerCase();
  if (lower.includes('feature')) return 'features';
  if (lower.includes('fix')) return 'fixes';
  if (lower.includes('performance')) return 'performance';
  return 'other';
}

// Generate release HTML blocks
const releasesHtml = releases.map((release, i) => {
  const tagHtml = i === 0 ? '\n                <div class="release-tag">Latest</div>' : '';
  const versionLink = release.compareUrl
    ? `<a href="${release.compareUrl}">${release.version}</a>`
    : release.version;

  const sectionsHtml = release.sections.map(section => {
    const cls = sectionClass(section.title);
    const itemsHtml = section.items.map(item => {
      const commitLink = item.commitHash && item.commitUrl
        ? ` <a href="${item.commitUrl}">${item.commitHash}</a>`
        : '';
      return `                    <li>${item.text}${commitLink}</li>`;
    }).join('\n');

    return `            <div class="change-section ${cls}">
                <h3>${section.title}</h3>
                <ul class="change-list">
${itemsHtml}
                </ul>
            </div>`;
  }).join('\n');

  return `        <div class="release">
            <div class="release-header">
                <div class="release-version">${versionLink}</div>
                <div class="release-date">${release.date}</div>${tagHtml}
            </div>
${sectionsHtml}
        </div>`;
}).join('\n\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blumbotron - Changelog</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #c8d6e5;
            background: #0a1929;
            background: linear-gradient(to bottom, #0d2137 0%, #071320 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            flex: 1;
        }

        header {
            text-align: center;
            padding: 2rem 0 1rem;
            color: #e8eef4;
        }

        .logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 1rem;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #e8eef4;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .breadcrumb {
            margin-bottom: 2rem;
        }

        .breadcrumb a {
            color: #d4a24e;
            text-decoration: none;
            font-weight: 600;
        }

        .breadcrumb a:hover {
            color: #e8c078;
            text-decoration: underline;
        }

        .breadcrumb span {
            color: #4a6480;
            margin: 0 0.5rem;
        }

        .breadcrumb .current {
            color: #8faabe;
        }

        h2 {
            font-size: 1.5rem;
            color: #e8eef4;
            margin-bottom: 1rem;
        }

        .release {
            background: rgba(10, 30, 55, 0.5);
            border: 1px solid #1e3a5f;
            border-radius: 2px;
            padding: 1.5rem 2rem;
            margin-bottom: 1.5rem;
        }

        .release-header {
            display: flex;
            align-items: baseline;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .release-version {
            font-size: 1.4rem;
            font-weight: 700;
            color: #e8eef4;
        }

        .release-version a {
            color: #e8eef4;
            text-decoration: none;
        }

        .release-version a:hover {
            color: #d4a24e;
        }

        .release-date {
            font-size: 0.9rem;
            color: #7a94ad;
        }

        .release-tag {
            display: inline-block;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 0.15rem 0.5rem;
            border-radius: 3px;
            background: rgba(212, 162, 78, 0.15);
            color: #d4a24e;
            border: 1px solid rgba(212, 162, 78, 0.3);
        }

        .change-section {
            margin-bottom: 1rem;
        }

        .change-section:last-child {
            margin-bottom: 0;
        }

        .change-section h3 {
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8faabe;
            margin-bottom: 0.5rem;
        }

        .change-section.features h3 {
            color: #d4a24e;
        }

        .change-section.fixes h3 {
            color: #6ba3d6;
        }

        .change-section.performance h3 {
            color: #7ec89e;
        }

        .change-list {
            list-style: none;
            padding: 0;
        }

        .change-list li {
            padding: 0.35rem 0;
            padding-left: 1.25rem;
            position: relative;
            color: #a0b4c8;
            font-size: 0.95rem;
        }

        .change-list li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.75rem;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #4a6480;
        }

        .change-section.features .change-list li::before {
            background: #d4a24e;
        }

        .change-section.fixes .change-list li::before {
            background: #6ba3d6;
        }

        .change-section.performance .change-list li::before {
            background: #7ec89e;
        }

        .change-list li a {
            color: #4a6480;
            text-decoration: none;
            font-size: 0.8rem;
            font-family: monospace;
        }

        .change-list li a:hover {
            color: #d4a24e;
        }

        .all-releases {
            text-align: center;
            margin-top: 2rem;
            color: #7a94ad;
        }

        .all-releases a {
            color: #d4a24e;
            text-decoration: none;
            font-weight: 600;
        }

        .all-releases a:hover {
            color: #e8c078;
            text-decoration: underline;
        }

        footer {
            text-align: center;
            padding: 2rem;
            color: #4a6480;
        }

        footer a {
            color: #d4a24e;
            text-decoration: none;
            font-weight: 600;
        }

        footer a:hover {
            color: #e8c078;
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }

            .release {
                padding: 1.25rem 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <a href="index.html"><img src="blumbotron_logo.svg" alt="Blumbotron Logo" class="logo"></a>
            <h1>Changelog</h1>
        </header>

        <nav class="breadcrumb">
            <a href="index.html">Home</a>
            <span>/</span>
            <span class="current">Changelog</span>
        </nav>

${releasesHtml}

        <div class="all-releases">
            <p>View all releases on <a href="https://github.com/mjlemay/blumbotron/releases" target="_blank">GitHub Releases</a></p>
        </div>
    </div>

    <footer>
        <p><a href="index.html">Home</a> &middot; <a href="documentation.html">Documentation</a> &middot; <a href="rfid-guide.html">RFID Guide</a></p>
        <p>Built with Tauri + React + TypeScript</p>
        <p><a href="https://github.com/mjlemay/blumbotron" target="_blank">View on GitHub</a></p>
    </footer>
</body>
</html>
`;

fs.writeFileSync(outputPath, html);
console.log(`Generated docs/changelog.html with ${releases.length} release(s)`);

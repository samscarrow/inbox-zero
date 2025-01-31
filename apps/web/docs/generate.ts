import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { glob } from "glob";
import { readFileSync, writeFileSync } from "fs";
import { resolve, relative } from "path";

interface DocFile {
  path: string;
  content: string;
  category: string;
}

const EXCLUDE_PATTERNS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
];

const CATEGORIES = {
  README: "Getting Started",
  CONTRIBUTING: "Contributing",
  CHANGELOG: "Changelog",
  LICENSE: "Legal",
  docs: "Documentation",
  blog: "Blog Posts",
};

async function findDocFiles(): Promise<DocFile[]> {
  const files = await glob("**/*.{md,mdx}", {
    ignore: EXCLUDE_PATTERNS,
    absolute: true,
  });

  return Promise.all(
    files.map(async (path) => {
      const content = readFileSync(path, "utf-8");
      const relativePath = relative(process.cwd(), path);
      const category =
        Object.entries(CATEGORIES).find(([key]) =>
          relativePath.includes(key),
        )?.[1] || "Other";

      return { path: relativePath, content, category };
    }),
  );
}

async function processContent(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify)
    .process(content);

  return String(result);
}

async function generateHTML(docs: DocFile[]): Promise<string> {
  const processedDocs = await Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      content: await processContent(doc.content),
    })),
  );

  const categorizedContent = processedDocs.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, typeof processedDocs>,
  );

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Documentation</title>
    <style>
        body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.5;
        max-width: 80ch;
        margin: 0 auto;
        padding: 2rem;
        }
        nav {
        position: sticky;
        top: 0;
        background: white;
        padding: 1rem 0;
        border-bottom: 1px solid #eee;
        }
        .category {
        margin-top: 2rem;
        }
        .file {
        margin: 2rem 0;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 4px;
        }
        h1, h2, h3 { 
        scroll-margin-top: 4rem;
        }
        a {
        color: #0066cc;
        text-decoration: none;
        }
        a:hover {
        text-decoration: underline;
        }
        code {
        background: #f5f5f5;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
        }
        pre code {
        display: block;
        padding: 1rem;
        overflow-x: auto;
        }
    </style>
    </head>
    <body>
    <nav>
        <h1>Project Documentation</h1>
        <h2>Contents</h2>
        ${Object.keys(categorizedContent)
          .map(
            (category) => `
        <h3><a href="#${category.toLowerCase().replace(/\s+/g, "-")}">${category}</a></h3>
        <ul>
            ${categorizedContent[category]
              .map(
                (doc) => `
            <li><a href="#${doc.path.replace(/[^\w]/g, "-")}">${doc.path}</a></li>
            `,
              )
              .join("")}
        </ul>
        `,
          )
          .join("")}
    </nav>
    
    ${Object.entries(categorizedContent)
      .map(
        ([category, docs]) => `
        <div class="category" id="${category.toLowerCase().replace(/\s+/g, "-")}">
        <h2>${category}</h2>
        ${docs
          .map(
            (doc) => `
            <div class="file" id="${doc.path.replace(/[^\w]/g, "-")}">
            <h3>${doc.path}</h3>
            ${doc.content}
            </div>
        `,
          )
          .join("")}
        </div>
    `,
      )
      .join("")}
    </body>
    </html>
`;

  return html;
}

async function main() {
  try {
    console.log("Finding documentation files...");
    const docs = await findDocFiles();

    console.log(`Found ${docs.length} documentation files`);

    console.log("Generating HTML...");
    const html = await generateHTML(docs);

    const outputPath = resolve(process.cwd(), "docs/documentation.html");
    writeFileSync(outputPath, html);

    console.log(`Documentation generated successfully at ${outputPath}`);
  } catch (error) {
    console.error("Error generating documentation:", error);
    process.exit(1);
  }
}

main();

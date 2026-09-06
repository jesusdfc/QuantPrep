import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import katex from "katex";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const contentRoot = path.join(repositoryRoot, "content");
const writeChanges = process.argv.includes("--write");
const markdownParser = unified().use(remarkParse).use(remarkMath);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function relativePath(filePath) {
  return path.relative(repositoryRoot, filePath);
}

function normalizeDisplayMath(source) {
  const output = [];
  let displayIndent = null;

  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    const indent = line.slice(0, line.length - line.trimStart().length);
    const delimiterCount = (line.match(/\$\$/g) ?? []).length;

    if (trimmed === "$$") {
      output.push(line);
      continue;
    }

    if (delimiterCount === 2 && trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
      const expression = trimmed.slice(2, -2);
      output.push(`${indent}$$`, `${indent}${expression}`, `${indent}$$`);
      continue;
    }

    if (delimiterCount === 1 && trimmed.startsWith("$$")) {
      displayIndent = indent;
      output.push(`${indent}$$`, `${indent}${trimmed.slice(2)}`);
      continue;
    }

    if (delimiterCount === 1 && trimmed.endsWith("$$") && displayIndent !== null) {
      output.push(line.slice(0, line.lastIndexOf("$$")).trimEnd(), `${displayIndent}$$`);
      displayIndent = null;
      continue;
    }

    output.push(line);
  }

  const compacted = [];
  let inDisplayMath = false;

  for (const line of output) {
    if (line.trim() === "$$") {
      if (inDisplayMath && compacted.at(-1)?.trim() === "") {
        compacted.pop();
      }
      compacted.push(line);
      inDisplayMath = !inDisplayMath;
      continue;
    }

    if (inDisplayMath && line.trim() === "" && compacted.at(-1)?.trim() === "$$") {
      continue;
    }

    compacted.push(line);
  }

  return compacted.join("\n");
}

function validateDelimiters(markdown, filePath, fieldName) {
  const errors = [];
  let inDisplayMath = false;

  for (const [index, line] of markdown.split("\n").entries()) {
    const trimmed = line.trim();
    const location = `${relativePath(filePath)} [${fieldName}] line ${index + 1}`;

    if (trimmed === "$$") {
      inDisplayMath = !inDisplayMath;
      continue;
    }

    if (line.includes("$$")) {
      errors.push(`${location}: display-math delimiters must be on their own lines`);
      continue;
    }

    if (!inDisplayMath) {
      const withoutEscapedDollars = line.replaceAll("\\$", "");
      const inlineDelimiterCount = (withoutEscapedDollars.match(/\$/g) ?? []).length;
      if (inlineDelimiterCount % 2 !== 0) {
        errors.push(`${location}: unmatched inline-math delimiter`);
      }
    }
  }

  if (inDisplayMath) {
    errors.push(`${relativePath(filePath)} [${fieldName}]: unmatched display-math delimiter`);
  }

  return errors;
}

function validateMarkdown(markdown, filePath, fieldName) {
  const errors = validateDelimiters(markdown, filePath, fieldName);
  const tree = markdownParser.parse(markdown);

  visit(tree, ["inlineMath", "math"], (node) => {
    try {
      katex.renderToString(node.value, {
        displayMode: node.type === "math",
        throwOnError: true,
      });
    } catch (error) {
      const line = node.position?.start.line ?? "?";
      errors.push(`${relativePath(filePath)} [${fieldName}] line ${line}: ${error.message}`);
    }
  });

  return errors;
}

function questionFields(document) {
  const fields = ["prompt", "solution", "answer"].flatMap((name) =>
    typeof document[name] === "string" ? [[name, document[name]]] : [],
  );

  if (Array.isArray(document.hints)) {
    fields.push(
      ...document.hints.flatMap((hint, index) =>
        typeof hint === "string" ? [[`hints[${index}]`, hint]] : [],
      ),
    );
  }

  return fields;
}

function theoryBody(source) {
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match?.[1] ?? source;
}

const contentFiles = walk(contentRoot).filter((filePath) => /\.(yaml|mdx)$/.test(filePath));
const errors = [];
let renderedFieldCount = 0;
let changedFileCount = 0;

for (const filePath of contentFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const normalizedSource = normalizeDisplayMath(source);

  if (writeChanges && normalizedSource !== source) {
    fs.writeFileSync(filePath, normalizedSource);
    changedFileCount += 1;
  }

  if (filePath.endsWith(".mdx")) {
    renderedFieldCount += 1;
    errors.push(...validateMarkdown(theoryBody(normalizedSource), filePath, "body"));
    continue;
  }

  if (!filePath.includes(`${path.sep}questions${path.sep}`)) {
    continue;
  }

  const document = parseYaml(normalizedSource);
  for (const [fieldName, markdown] of questionFields(document)) {
    renderedFieldCount += 1;
    errors.push(...validateMarkdown(markdown, filePath, fieldName));
  }
}

if (errors.length > 0) {
  console.error(`Math rendering validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const writeSummary = writeChanges ? `; normalized ${changedFileCount} file(s)` : "";
console.log(
  `Math rendering validation passed for ${renderedFieldCount} fields in ${contentFiles.length} files${writeSummary}.`,
);

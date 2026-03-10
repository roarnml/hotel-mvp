const fs = require("fs");
const path = require("path");

// CONFIG — tweak if needed
const OUTPUT_FILE = "folder-structure.txt";
const IGNORE = new Set(["node_modules", ".git", ".next", "dist"]);

/**
 * Recursively builds directory tree
 */
function walkDir(dir, prefix = "") {
  let output = "";
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach((item, index) => {
    if (IGNORE.has(item.name)) return;

    const isLast = index === items.length - 1;
    const pointer = isLast ? "└── " : "├── ";
    const nextPrefix = prefix + (isLast ? "    " : "│   ");

    output += `${prefix}${pointer}${item.name}\n`;

    if (item.isDirectory()) {
      const fullPath = path.join(dir, item.name);
      output += walkDir(fullPath, nextPrefix);
    }
  });

  return output;
}

// ENTRY POINT
(function generate() {
  const rootDir = process.cwd();
  let structure = `📁 ${path.basename(rootDir)}\n`;
  structure += walkDir(rootDir);

  fs.writeFileSync(OUTPUT_FILE, structure, "utf8");
  console.log(`✅ Folder structure exported to ${OUTPUT_FILE}`);
})();

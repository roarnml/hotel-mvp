import { merge } from "prisma-merge";
import { writeFileSync } from "fs";

const merged = merge("./prisma/schema/**/*.prisma");

writeFileSync("./prisma/schema.prisma", merged);

console.log("✨ Prisma schema merged successfully!");

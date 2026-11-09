import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Only published files participate: documentation changes do not invalidate the app.
export async function releaseVersion(directory, files) {
  const { version } = JSON.parse(
    await readFile(resolve(directory, "package.json"), "utf8"),
  );
  assert(
    /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version),
    "Invalid application release version",
  );
  const hash = createHash("sha256");
  for (const file of [...files].sort()) {
    const content = await readFile(resolve(directory, file));
    hash.update(file + "\0" + content.length + "\0");
    hash.update(content);
  }
  return `dang-v${version}-${hash.digest("hex").slice(0, 16)}`;
}

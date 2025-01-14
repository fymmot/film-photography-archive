// https://docs.astro.build/en/guides/imports/#node-builtins
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import type { AstroIntegration, AstroConfig } from "astro";

// Inspired by https://github.com/withastro/astro/issues/4961#issuecomment-2322936873
function removeOriginalImages() {
  let astroConfig: AstroConfig;

  // Used to identify original image files
  const ORIGINAL_IMAGE_FORMATS = ["jpg", "jpeg", "png"] as const;
  // Regex pattern: `dot eight hash chars dot`
  const ORIGINAL_IMAGE_HASH_PATTERN = "\\.[a-zA-Z0-9_\\-]{8}\\.";

  const integration: AstroIntegration = {
    name: "ROI",
    hooks: {
      "astro:config:done": ({ config }) => {
        astroConfig = config;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const astroAssetsDir = path.join(dir.pathname, astroConfig.build.assets);
        const files = await readdir(astroAssetsDir);

        let foundFilesCount = 0;
        let removedFilesCount = 0;

        for (const file of files) {
          const { ext } = path.parse(file);
          // Strip `ext` of dot also for use in upcoming regex match, as dots have special meaning
          const fileFormat = ext.slice(1);

          if (!(ORIGINAL_IMAGE_FORMATS as ReadonlyArray<string>).includes(fileFormat)) continue;

          // Match original image files by ending with single hash and extension
          const reOriginalImage = new RegExp(`${ORIGINAL_IMAGE_HASH_PATTERN}${fileFormat}$`);
          if (!reOriginalImage.test(file)) continue;

          foundFilesCount++;
          // logger.warn(`Removing ${file}`);

          const result = await unlink(path.join(astroAssetsDir, file));

          if (isUnlinkSuccessful(result)) {
            removedFilesCount++;
          } else {
            logger.error(`Couldn't remove file ${file}`);
          }
        }

        if (foundFilesCount > 0) {
          logger.warn(`Removed ${removedFilesCount}/${foundFilesCount} files.`);
        }

        /** Helper function */
        function isUnlinkSuccessful(result: unknown): boolean {
          // https://nodejs.org/docs/latest-v20.x/api/fs.html#fspromisesunlinkpath
          return typeof result === "undefined";
        }
      },
    },
  };

  return integration;
}

export default removeOriginalImages;
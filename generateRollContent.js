import fs from "fs";
import path from "path";
import ExifReader from "exifreader";
import dotenv from "dotenv";
dotenv.config();

// Process command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && (args[0] === "-h" || args[0] === "--help")) {
  console.log("Usage: node generateRollContent.js <sourceDirectory>");
  console.log("The source directory is required and must exist");
  process.exit(0);
}

const sourceDir = args[0];
if (!sourceDir) {
  console.error("Error: Source directory is required");
  console.log("Usage: node generateRollContent.js <sourceDirectory>");
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Error: Source directory "${sourceDir}" does not exist`);
  process.exit(1);
}

const targetDir = "./src/assets/images/"; // Directory where images will be copied

export async function loadExifData(imagePath) {
  try {
    // Normalize the path by removing any Astro-specific prefix and query parameters
    let normalizedPath = imagePath.replace("/@fs", "").split("?")[0];

    // Check if the path is in the production format and adjust accordingly
    if (normalizedPath.startsWith("/_astro/")) {
      // Assuming production paths need to be mapped to a specific directory
      normalizedPath = path.join(
        process.cwd(),
        "dist",
        "_astro",
        normalizedPath.substring(8),
      );
    } else {
      // Development path, adjust if necessary
      normalizedPath = path.resolve(process.cwd(), normalizedPath);
    }

    const buffer = await fs.promises.readFile(normalizedPath); // Changed to fs.promises.readFile
    const tags = ExifReader.load(buffer, {
      expanded: false,
      includeUnknown: true,
    });
    return tags;
  } catch (error) {
    console.error("Error loading EXIF data:", error);
    return null;
  }
}

async function getExifDataFromFirstImage(folderPath) {
  try {
    const files = await fs.promises.readdir(folderPath);
    const imageFiles = files.filter(
      (file) => file.endsWith(".jpg") || file.endsWith(".jpeg"),
    );
    if (imageFiles.length === 0) {
      console.error("No images found in the folder.");
      return null;
    }
    const firstImage = imageFiles[0];
    const exifData = await loadExifData(path.join(folderPath, firstImage));
    if (!exifData) {
      console.error("Failed to load EXIF data.");
      return null;
    }
    const cameraMake = exifData?.Make?.description || "";
    const cameraModel = exifData?.Model?.description || "";
    const film = exifData?.Film?.description;
    const keywords = exifData?.Keywords?.map((keyword) => keyword.description);
    return {
      camera: `${cameraMake} ${cameraModel}`.trim() || "Leica M6", // Default to "Leica M6" if no camera info
      film: film,
      keywords: keywords,
    };
  } catch (error) {
    console.error("Error exif date from first image:", error);
    return null;
  }
}

// Utility function to slugify folder names
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// Function to format ID to 2 digits (keeping consistent with renameRollFiles.js)
function formatId(id) {
  return id.toString().padStart(2, "0");
}

// Updated function to generate consistent filenames
function generateFilename(folderName) {
  const [dateAndId, titlePart] = folderName.split(" - ");

  // Handle both formats: YYYYMM-ID and YYYY-MM-ID
  let year, month, id;

  if (dateAndId.includes("-")) {
    // Format: YYYY-MM-ID
    const parts = dateAndId.split("-");
    year = parts[0];
    month = parts[1];
    id = parts[2];
  } else {
    // Format: YYYYMM-ID
    const parts = dateAndId.split("-");
    year = parts[0].slice(0, 4);
    month = parts[0].slice(4, 6);
    id = parts[1];
  }

  const title = slugify(titlePart?.trim() || "");
  return `${year}-${month}-${formatId(id)}-${title}.md`;
}

// Function to parse date and ID from folder name (used in generateMarkdown)
function parseDateAndId(folderName) {
  const [dateAndId] = folderName.split(" - ");

  if (dateAndId.includes("-")) {
    // Format: YYYY-MM-ID
    const [year, month, id] = dateAndId.split("-");
    return {
      year,
      month,
      id: parseInt(id),
    };
  } else {
    // Format: YYYYMM-ID
    const parts = dateAndId.split("-");
    return {
      year: parts[0].slice(0, 4),
      month: parts[0].slice(4, 6),
      id: parseInt(parts[1]),
    };
  }
}

// Updated function to generate markdown content
function generateMarkdown(folderName, images, camera, film) {
  const [, titlePart] = folderName.split(" - ");
  const {
    year: rollYear,
    month: rollMonth,
    id: rollId,
  } = parseDateAndId(folderName);
  const title = titlePart?.trim();
  const startDate = `${rollYear}-${rollMonth}-01`; // Correctly formatted start date
  const endDate = `${rollYear}-${rollMonth}-01`; // Correctly formatted end date

  let markdown = `---
roll_id: ${rollId}
roll_year: ${rollYear}
roll_month: ${parseInt(rollMonth)}
title: ${title}
camera: ${camera}
film: ${film}
film_speed: 400
location: 
  - Stockholm
start_date: ${startDate}
end_date: ${endDate}
images:
`;

  images.forEach((image) => {
    const imageName = path.basename(image);
    const altText = "";
    markdown += `  - image: ${targetDir.split(".").pop()}${imageName}
    alt: ${altText}
`;
  });

  markdown += `---
`;

  return markdown;
}

// Read each folder in the source directory
fs.readdir(sourceDir, { withFileTypes: true }, (err, folders) => {
  if (err) {
    console.error("Failed to read directory:", err);
    return;
  }

  folders.forEach(async (folder) => {
    if (folder.isDirectory()) {
      const folderPath = path.join(sourceDir, folder.name);
      const exifData = await getExifDataFromFirstImage(folderPath);
      const camera = exifData?.camera || "Leica M6";
      const film = exifData?.film || "Ilford HP5 Plus";
      fs.readdir(folderPath, async (err, files) => {
        if (err) {
          console.error("Failed to read folder:", err);
          return;
        }

        const images = files.filter((file) => file.endsWith(".jpg")); // Filter for JPEG images
        const markdown = generateMarkdown(folder.name, images, camera, film);

        const rollsDir = path.join("./src/content/rolls");
        if (!fs.existsSync(rollsDir)) {
          fs.mkdirSync(rollsDir);
        }

        const filename = generateFilename(folder.name);
        const markdownPath = path.join(rollsDir, filename);

        // Check if the markdown file already exists
        if (fs.existsSync(markdownPath)) {
          console.log(
            `Skipping: Markdown file already exists: ${markdownPath}`,
          );
          return;
        }

        fs.writeFile(markdownPath, markdown, (err) => {
          if (err) {
            console.error("Failed to write markdown file:", err);
          } else {
            console.log(`Markdown file created: ${markdownPath}`);
          }
        });

        // Optionally copy images to target directory
        images.forEach((image) => {
          const srcPath = path.join(folderPath, image);
          const destPath = path.join(targetDir, image);
          fs.copyFile(srcPath, destPath, (err) => {
            if (err) {
              console.error("Failed to copy image:", err);
            }
          });
        });
      });
    }
  });
});

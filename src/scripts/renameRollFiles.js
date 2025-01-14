import { readdirSync, renameSync } from "fs";
import { join } from "path";

const ROLLS_DIR = "src/content/rolls";

// Function to format numbers to 2 digits
const formatTwoDigits = (num) => {
  return num.toString().padStart(2, "0");
};

// Get all MD files in the rolls directory
const files = readdirSync(ROLLS_DIR).filter((file) => file.endsWith(".md"));

files.forEach((file) => {
  if (file === ".DS_Store") return;

  let newName;

  // Extract year, month, id, and name using a more flexible regex
  const pattern = /^(\d{4})-(\d{1,2})-(\d{1,2})-?(.*)\.md$/;
  const match = file.match(pattern);

  if (match) {
    const [, year, month, id, name] = match;
    // Only create new name if month or id needs padding
    if (month.length === 1 || id.length === 1) {
      newName = `${year}-${formatTwoDigits(month)}-${formatTwoDigits(id)}${name ? "-" + name : ""}.md`;
    }
  }

  if (newName && newName !== file) {
    try {
      const oldPath = join(ROLLS_DIR, file);
      const newPath = join(ROLLS_DIR, newName);
      renameSync(oldPath, newPath);
      console.log(`Renamed: ${file} -> ${newName}`);
    } catch (error) {
      console.error(`Error renaming ${file}: ${error.message}`);
    }
  }
});

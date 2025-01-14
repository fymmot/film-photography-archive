import ExifReader from "exifreader";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const addSrcSetHeightValue = (srcSet: string) => {
  return srcSet.split(', ').map((entry) => {
    const [url, size] = entry.split(' ');
    const widthMatch = url.match(/&w=(\d+)/);
    if (widthMatch) {
      const width = widthMatch[1];
      const updatedUrl = url.includes('&h=') 
        ? url.replace(/&h=\d+/, `&h=${width}`) 
        : `${url}&h=${width}`;
      return `${updatedUrl} ${size}`;
    }
    return entry; // Return the original entry if no width is found
  }).join(', ');
}

export const normalizePath = (imagePath: string) => {
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
  return normalizedPath;
};
// Function to load and extract EXIF data from a local file
export async function loadExifData(imagePath: string) {
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

    const buffer = await fs.readFile(normalizedPath);
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

interface CollageOptions {
  width?: number;
  height?: number;
  gap?: number;
  background?: { r: number; g: number; b: number };
  gridSize?: number; // 2 for 2x2, 3 for 3x3, etc.
}

export interface CollageImage {
  image: {
    src: string;
    width?: number;
    height?: number;
    format?: string;
  };
  alt?: string;
  feature?: string;
}

interface CollageResult {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export async function createCollage(
  images: CollageImage[],
  slug: string,
  title: string,
  options: CollageOptions = {}
): Promise<CollageResult | null> {
  if (!images || images.length === 0) return null;

  const GRID_SIZE = options.gridSize || 2;
  const COLLAGE_WIDTH = options.width || 1200;
  const COLLAGE_HEIGHT = options.height || 1200;
  const GAP = options.gap || 0;
  
  // Calculate dimensions ensuring we get integer values
  const imageWidth = Math.floor((COLLAGE_WIDTH - (GAP * (GRID_SIZE - 1))) / GRID_SIZE);
  const imageHeight = Math.floor((COLLAGE_HEIGHT - (GAP * (GRID_SIZE - 1))) / GRID_SIZE);
  
  // Recalculate the actual collage size to account for rounding
  const actualWidth = (imageWidth * GRID_SIZE) + (GAP * (GRID_SIZE - 1));
  const actualHeight = (imageHeight * GRID_SIZE) + (GAP * (GRID_SIZE - 1));

  // Get available images without padding
  const selectedImages = images.slice(0, GRID_SIZE * GRID_SIZE);

  // Create a blank canvas
  const canvas = sharp({
    create: {
      width: actualWidth,
      height: actualHeight,
      channels: 3,
      background: options.background || { r: 0, g: 0, b: 0 },
    },
  });

  // Process each image and create composite array
  const composites = await Promise.all(
    selectedImages.map(async (image, index) => {
      const processedImage = await sharp(normalizePath(image.image.src))
        .resize(imageWidth, imageHeight, {
          fit: "cover",
          position: "center",
        })
        .toBuffer();

      // Calculate position (NxN grid)
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const x = col * (imageWidth + GAP);
      const y = row * (imageHeight + GAP);

      return {
        input: processedImage,
        top: y,
        left: x,
      };
    })
  );

  // Create the final collage
  const collage = await canvas.composite(composites).webp().toBuffer();

  // Save the collage to a temporary file in the appropriate directory
  const collageFilename = `${slug}-collage.webp`;
  const outputDir = import.meta.env.DEV
    ? path.join(process.cwd(), "public", "_astro")
    : path.join(process.cwd(), "dist", "_astro");

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, collageFilename), collage);

  return {
    url: `/_astro/${collageFilename}`,
    width: actualWidth,
    height: actualHeight,
    alt: `Collage of ${selectedImages.length} photos from ${title}`,
  };
}

// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";
// 2. Define your collection(s)

const featuresCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      heroImage: image().optional(),
      images: z
        .array(
          z.object({
            image: image().optional(),
            alt: z.union([z.string(), z.null()]).optional(),
          }),
        )
        .optional(),
    }),
});

// 2. Define a `type` and `schema` for each collection
const filmRollsCollection = defineCollection({
  type: "content", // v2.5.0 and later
  schema: ({ image }) =>
    z.object({
      roll_id: z.number(),
      roll_year: z.number(),
      roll_month: z.number(),
      publish_date: z.date().optional(),
      title: z.string(),
      camera: z.string(),
      lenses: z.array(z.string()).optional(),
      film: z.string(),
      film_speed: z.number().optional(),
      developer: z.string().optional(),
      location: z.union([z.string(), z.array(z.string())]).optional(),
      comments: z.string().optional(),
      images: z
        .array(
          z.object({
            image: image(),
            alt: z.union([z.string(), z.null()]).optional(),
            feature: z.union([z.string(), z.null()]).optional(),
          }),
        )
        .optional(),
      start_date: z.date().optional(), // Using string for ISO date format
      end_date: z.date().optional(), // Using string for ISO date format
      tags: z.union([z.array(z.string()), z.null()]).optional(),
      layout: z.string().optional(), // Optional as it might be consistent across all entries
    }),
});
// Define a `type` and `schema` for the "pages" collection

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  rolls: filmRollsCollection,
  features: featuresCollection,
};

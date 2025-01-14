/*
This script is updates the Decap CMS configuration with the latest camera, lens, and film options from the photographer's configuration file. 
It is also used for filtering rolls on the /rolls page.

The script should be run after initializing the project, or whenever the photographer's configuration changes.

Run with:
`node setup.js`
*/

// Importing the necessary modules
import fs from "fs";
import yaml from "js-yaml";

// Function to load YAML file
function loadYamlFile(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents);
  } catch (e) {
    console.error(`Failed to read ${filePath}: ${e}`);
    process.exit(1);
  }
}

// Function to save YAML file
function saveYamlFile(filePath, data) {
  try {
    const yamlStr = yaml.dump(data, { lineWidth: -1 });
    fs.writeFileSync(filePath, yamlStr, "utf8");
  } catch (e) {
    console.error(`Failed to write ${filePath}: ${e}`);
    process.exit(1);
  }
}

// Function to generate markdown files for each feature
function generateFeatureFiles(features) {
  const featuresDir = "src/content/features";
  if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir);
  }

  features.forEach((feature) => {
    const filename = `${featuresDir}/${feature.toLowerCase().replace(/ /g, "-")}.md`;
    if (!fs.existsSync(filename)) {
      const content = `---
title: "${feature}"
images: []
---
`;
      fs.writeFileSync(filename, content);
      console.log(`Generated markdown file for feature: ${feature}`);
    }
  });
}

// Function to update the feature options in the CMS config
function updateFeatureOptions(cmsConfig, features) {
  const featureOptions = features.map((feature) => feature.trim());
  cmsConfig.collections.forEach((collection) => {
    if (collection.name === "rolls") {
      collection.fields.forEach((field) => {
        if (field.name === "images") {
          field.fields.forEach((subField) => {
            if (subField.name === "feature") {
              subField.options = featureOptions;
            }
          });
        }
      });
    }
  });
}

// Function to update the tags options in the CMS config
function updateTagOptions(cmsConfig, tags) {
  const tagOptions = tags.map((tag) => tag.trim());
  cmsConfig.collections.forEach((collection) => {
    if (collection.name === "rolls") {
      collection.fields.forEach((field) => {
        if (field.name === "tags") {
          field.options = tagOptions;
        }
      });
    }
  });
}

// Function to update the lens options in the CMS config
function updateLensOptions(cmsConfig, lenses) {
  const lensOptions = lenses.map((lens) => lens.trim());
  cmsConfig.collections.forEach((collection) => {
    if (collection.name === "rolls") {
      collection.fields.forEach((field) => {
        if (field.name === "lenses") {
          field.options = lensOptions;
        }
      });
    }
  });
}

// Main function to update config and generate feature files
function updateConfigAndGenerateFeatures() {
  const userConfig = loadYamlFile("global.config.yml");
  const cmsConfig = loadYamlFile("public/admin/config.yml");

  // Update camera, film, lens, and feature options in CMS config
  const cameraOptions = [
    ...userConfig.cameras35mm,
    ...userConfig.camerasMediumFormat,
  ].map((camera) => camera.trim());
  const filmOptions = [
    ...userConfig.black_and_white_films,
    ...userConfig.color_films,
  ].map((film) => film.trim());
  const lensOptions = userConfig.lenses.map((lens) => lens.trim()); // Assuming 'lenses' is the correct key in userConfig
  const tagOptions = userConfig.custom_tags.map((tag) => tag.trim());

  cmsConfig.collections.forEach((collection) => {
    collection.fields.forEach((field) => {
      if (field.name === "camera") {
        field.options = cameraOptions;
      }
      if (field.name === "film") {
        field.options = filmOptions;
      }
      if (field.name === "lenses") {
        field.options = lensOptions;
      }
    });
  });

  updateLensOptions(cmsConfig, userConfig.lenses); // Update lenses in CMS config
  updateFeatureOptions(cmsConfig, userConfig.features);
  updateTagOptions(cmsConfig, userConfig.custom_tags);

  saveYamlFile("public/admin/config.yml", cmsConfig);
  console.log("CMS configuration updated successfully!");
  console.log(
    `Added ${cameraOptions.length} cameras, ${filmOptions.length} films, ${lensOptions.length} lenses, ${userConfig.features.length} features, and ${tagOptions.length} tags`,
  );

  // Generate markdown files for features
  generateFeatureFiles(userConfig.features);
}

updateConfigAndGenerateFeatures();

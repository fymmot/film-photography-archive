import spaceImport from "contentful-import";
import inquirer from "inquirer";
import { readFile, writeFile, rm } from "fs/promises";
import { join, basename, resolve, parse } from "path";

async function main() {
  const __dirname = resolve();
  const DIR_NAME = basename(parse(__dirname).dir);

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "spaceId",
      message: "Enter you Contentful Space ID",
      validate(value) {
        if (!value.length > 0) {
          return "Must enter a Space ID";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "contentDeliveryApiKey",
      message: "Enter you Content Delivery API Key",
      validate(value) {
        if (!value.length > 0) {
          return "Must enter Content Delivery API Key";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "contentManagementToken",
      message: "Enter you Content Management Token",
      validate(value) {
        if (!value.length > 0) {
          return "Must enter Content Management Token";
        }
        return true;
      },
    },
  ]);
  console.log("🆕 Creating .env file...");
  const ENV_PATH = join(__dirname, ".env");
  const newEnv = [
    `# All environment variables will be sourced`,
    `# and made available.`,
    `# Do NOT commit this file to source control`,
    `CONTENTFUL_SPACE_ID='${answers.spaceId}'`,
    `CONTENTFUL_DELIVERY_TOKEN='${answers.contentDeliveryApiKey}'`,
  ]
    .filter(Boolean)
    .join("\n");
  console.log(`🔄 Updating files...`);

  await Promise.all([writeFile(ENV_PATH, newEnv)]);

  console.log(`🏃‍♀️🏃🏃‍♂️ Running the setup script to import content model`);

  await spaceImport({
    contentFile: `${__dirname}/bin/contentful/export.json`,
    spaceId: answers.spaceId,
    managementToken: answers.contentManagementToken,
  });

  console.log(`🗑️ Removing the setup dependencies`);

  await rm(`${__dirname}/bin/node_modules`, { recursive: true });

  console.log(`✅  Project is ready! Start development with "npm run dev"`);
}

main();

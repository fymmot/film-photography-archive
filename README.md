# Film photography archive

An open-source template for a film photography portfolio: publish your rolls, add metadata (camera, film, locations), and showcase highlights. All content lives in your own GitHub repository.

> **New to GitHub or the command line?** See the [simplified setup guide](SETUP_SIMPLE.md) for step-by-step help with no coding.

---

## Screenshots

| Landing page | Roll page | Archive & filter |
|--------------|-----------|------------------|
| ![Landing page](src/assets/readme/landing.webp) | ![Roll page](src/assets/readme/roll.webp) | ![Archive](src/assets/readme/archive.webp) |

| Search and filter | Adding a roll in the CMS |
|-------------------|---------------------------|
| ![Filter](src/assets/readme/filter.webp) | ![Decap CMS](src/assets/readme/decapcms.webp) |

---

## What you get

- **Roll-by-roll publishing** with metadata (camera, film, lenses, dates, locations)
- **Web-based admin** (Decap CMS) so you can add and edit rolls in the browser—no need to edit files by hand
- **Search and filters** by camera, film, location, date, etc.
- **Lightbox viewer** with touch support and full-screen
- **Light and dark themes**, **accessible** (WCAG 2.2 when you add alt text to images)
- **Optional**: visitor comments, batch import from folders of photos

---

## Get your site online (step by step)

### 1. Get a copy of the project

- **Option A:** On GitHub, click **Use this template** → **Create a new repository**, then clone it to your computer (or use GitHub Codespaces).
- **Option B:** Follow the [simplified setup guide](SETUP_SIMPLE.md) if you prefer a guided flow.

### 2. Configure your site

Open **`global.config.yml`** in the project root and set:

- **Site name** and **base URL** (your site’s public URL, e.g. `https://myfilm.netlify.app`)
- **Author** name and **default title** for the site
- Any other options described in the file

Save the file.

### 3. (Optional) Add your cameras, films, and lenses to the CMS

So the admin suggests your gear when you add a roll:

1. In **`global.config.yml`**, add your cameras, films, and lenses under the sections shown there.
2. In a terminal, from the project folder, run: **`yarn setup`** (or `npm run setup`).

### 4. Deploy to Netlify

1. Go to [netlify.com](https://www.netlify.com) and sign in (or create an account).
2. Click **Add new site** → **Import an existing project** and connect your GitHub account.
3. Select the repository you created. Netlify will suggest:
   - **Build command:** `yarn build` (or `npm run build`)
   - **Publish directory:** `dist`
4. Click **Deploy site** and wait for the first build to finish.

### 5. Turn on login for the admin

1. In Netlify: **Site configuration** → **Identity** → **Enable Identity**.
2. Under **Registration**, set it to **Invite only** (recommended).
3. Open **Identity** → **Invitations** and **Invite** yourself (use the email you want to use for the CMS).
4. Accept the invite from the email and set a password.
5. Go to **Site configuration** → **Identity** → **Services** and enable **Git Gateway** (so the CMS can save changes to GitHub).

### 6. Set environment variables so images work in the admin

1. In Netlify: **Site configuration** → **Environment variables** → **Add a variable** (or **Import from .env**).
2. Add:
   - **`GITHUB_REPO_OWNER`** = your GitHub username (or organization name)
   - **`GITHUB_REPO_NAME`** = the name of this repository (e.g. `film-photography-archive`)
   - **`GITHUB_TOKEN`** = a [GitHub Personal Access Token](https://github.com/settings/tokens) with **repo** (or at least **contents: read**). Needed for image previews and to avoid rate limits.
3. **Save** and trigger a **new deploy** (Deploys → Trigger deploy) so the new variables are used.

### 7. You’re live

- Your site: **`https://<your-site-name>.netlify.app`**
- Admin (add and edit rolls): **`https://<your-site-name>.netlify.app/admin`**

Log in with the Identity account you invited, then you can create rolls, upload photos, and publish.

---

## Adding content

### Adding a roll

- Easiest: open **`/admin`** on your site, log in, and use **New Film roll**.
- You can also add a new file in **`src/content/rolls`** (see existing rolls for the format).

### How rolls are numbered

Rolls are numbered **per calendar month**. For example: in October you use 1, 2, 3…; in November you start from 1 again. The site uses a slug like **year–month–roll number–title** (e.g. 2018-5-1-italy).

### Adding a new camera, film, or lens

1. Edit **`global.config.yml`** and add the new camera, film, or lens in the right section.
2. Run **`yarn setup`** (or `npm run setup`). The CMS will then offer them when you edit a roll.

### Highlights / features

Highlights (featured collections) are in **`src/content/features`**. You can create them in the CMS or by adding markdown files. To link a photo in a roll to a feature, set the **Feature** field on that image to the feature name (e.g. “Scotland”).

### Batch import

To generate many rolls from folders of photos, use the **`generateRollContent.js`** script. Folders should be named like **`YYYYMM-<roll-number>`** (e.g. `201805-1`). Run:

```bash
node generateRollContent.js /path/to/your/photo/folders
```

---

## FAQ

**Images don’t show in the admin preview**  
Make sure **`GITHUB_REPO_OWNER`**, **`GITHUB_REPO_NAME`**, and **`GITHUB_TOKEN`** are set in Netlify (see step 6 above), then trigger a new deploy.

**Newly uploaded image doesn’t appear in the preview**  
New photos should usually show in the preview, but it may not always work. If you don’t see the image, try **Publish** (to save it to the repo) and **reload the preview**.

**Build on Netlify times out**  
The first build can be slow with many images. You can build locally and deploy with **`npx netlify deploy --prod`**, or temporarily remove some rolls, deploy, then add them back.

**Visitor comments**  
Set **`enable_comments: "on"`** in **`global.config.yml`** and add a **`GITHUB_TOKEN`** with write access in Netlify. Comments are submitted as pull requests; you approve them in GitHub.

**Translations**  
UI text is in the **`i18n`** folder. You can add another language by following the existing structure.

---

## Local development

Use this if you want to run the site and admin on your computer.

1. **Clone the repo** and run **`yarn install`** (or `npm install`).
2. Edit **`global.config.yml`** (and run **`yarn setup`** if you changed cameras/films/lenses).
3. **Build the admin UI** once: **`cd admin-app && npm install`**, then from the project root **`npm run build:admin`**.
4. **Run the site:** **`yarn dev`** (or `npm run dev`). Open **http://localhost:4321** (or the port shown).
5. **Admin at http://localhost:4321/admin**  
   - For **published** images to show in the preview, run **`netlify dev`** instead of `yarn dev`, and add a **`.env`** (copy from **`.env.example`**) with **`GITHUB_REPO_OWNER`**, **`GITHUB_REPO_NAME`**, and **`GITHUB_TOKEN`**.
   - For **draft** uploads to show in the preview, run **`npx decap-server`** in a second terminal.

The main **`yarn build`** (or **`npm run build`**) builds both the admin and the site; use it before deploying or to test the production build with **`npx astro preview`**.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Photos in **`src/assets/images/images`** are by Tommy Feldt and are under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

## Acknowledgements

- Hasselblad icon from [The Noun Project](https://thenounproject.com/term/hasselblad/10135/) by Assiya Dauyek (CC BY 3.0).
- [PhotoSwipe](https://photoswipe.com/) (MIT) for the gallery.

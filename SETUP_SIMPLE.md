# Simplified setup guide

This guide will help you set up your film photography website without any coding or command line knowledge. We'll do everything through web interfaces.

## 1. Create your repository from the template

First, you'll need a GitHub account:
1. If you don't have a GitHub account, go to [GitHub](https://github.com) and click "Sign up"
2. Follow the registration steps to create your account

Then create your site:
1. Go to the [repository page](https://github.com/tommyfeldt/film-photography-archive)
2. Click the green "Use this template" button
3. Choose "Create a new repository"
4. Fill in:
   - Owner (your GitHub account)
   - Repository name (e.g., "my-film-archive")
   - Description (optional)
   - Choose "Private" visibility
5. Click "Create repository from template"
6. Wait for GitHub to create your copy

## 2. Configure your site

You'll need to edit a few files directly on GitHub:

### Edit global.config.yml
1. In your newly created repository, find and click on `global.config.yml`
2. Click the pencil icon (Edit this file)
3. Update the following settings:
   ```yaml
   site_name: "Your Site Name"
   site_description: "Your site description"
   photographer_name: "Your Name"

   # Contact information
   name: "Your name"
   email: "your@email.com"
   
   # Social media (remove or leave empty if you don't want to show these)
   instagram: "your_instagram_handle"
   flickr: "your_flickr_handle"
   facebook: "your_facebook_handle"  # Just the username, not the full URL
   ```
4. Click "Commit changes" at the bottom

Note: The camera, film, and lens lists in this file are only used by the setup script for local development. We'll configure these directly in the CMS config instead.

### Edit astro.config.mjs
1. Find and open `astro.config.mjs`
2. Click the pencil icon
3. Update the `site` field with your Netlify URL (or custom domain if you have one):
   ```js
   export default defineConfig({
     output: "static",
     site: "https://your-site-name.netlify.app/", // Change this to your actual site URL
     // ... rest of the config
   });
   ```
4. Click "Commit changes"

### Edit public/admin/config.yml
The CMS config is used to configure the admin interface.

1. Find and open `public/admin/config.yml`
2. Click the pencil icon
3. Find the `collections` section and locate the `rolls` collection
4. Update the camera options to match your cameras:
   ```yaml
   - label: Camera
     name: camera
     widget: select
     required: true
     options:
       - Your Camera 1
       - Your Camera 2
       # Add all your cameras here
   ```
5. Update the film options:
   ```yaml
   - label: Film
     name: film
     widget: select
     required: true
     options:
       - Your Film 1
       - Your Film 2
       # Add all your films here
   ```
6. Update the lens options:
   ```yaml
   - label: Lenses
     name: lenses
     widget: select
     options:
       - Your Lens 1
       - Your Lens 2
       # Add all your lenses here
     multiple: true
     required: false
   ```
7. Click "Commit changes"

Note: These equipment lists in the CMS config are what will actually be used by the admin interface.

## 3. Deploy to Netlify
Netlify is used to host your site. Every time you add new content, the site will automatically be redeployed which can take a few minutes.

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up/Login (you can use your GitHub account)
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and authorize Netlify
5. Select your repository
6. Use these build settings:
   - Build command: `yarn build`
   - Publish directory: `dist`
7. Click "Deploy site"
8. After the first deploy completes, Netlify will give you a random URL (like `random-name.netlify.app`). Feel free to change the name to something more memorable. You can also add a custom domain later.
9. Go back to your repository on GitHub and edit `astro.config.mjs` with your Netlify URL:
   ```js
   export default defineConfig({
     output: "static",
     site: "https://your-site-name.netlify.app/", // Add your Netlify URL here
     // ... rest of the config
   });
   ```
10. Commit the change and wait for Netlify to redeploy

## 4. Enable Netlify identity
Netlify Identity is used to manage users and permissions for the admin interface where you can add rolls.

1. Go to your site settings in Netlify
2. Click on "Identity" in the left menu
3. Click "Enable Identity"
4. Under "Registration preferences", choose "Invite only"
5. Under "External providers", click "Enable GitHub"
5. Under "Services" → "Git Gateway", click "Enable Git Gateway"

## 5. Access the admin interface

1. Go to your deployed site URL (something like `random-name.netlify.app`)
2. Add `/admin` to the URL (e.g., `random-name.netlify.app/admin`)
3. Click "Login with Netlify Identity"
4. Click "Login with GitHub"
5. You should now be in the admin interface!

## 6. Add your first roll

1. In the admin interface, click "Rolls" in the left menu
2. Click "New Roll"
3. Fill in the details:
   - Title
   - Year
   - Month
   - ID
   - Camera
   - Film
   - Lenses
   - Location
   - Upload some photos
4. Click "Publish". It will take a few minutes for the site to be redeployed.

## 7. Customize your site content

You can customize the texts shown on your site by editing the markdown files in the `src/content` folder:

### Landing page
Edit `src/content/pages/landing-page.md` to change your site's main page:
```yaml
---
title: "Your name"
subtitle: "Film photography archive"
pageTitle: "Your name Film Photography"
seoDescription: "A personal archive of film photos and film rolls by Your name."
---
```

### Footer
Edit `src/content/pages/footer.md` to add your bio:
```markdown
Add a short description of yourself here.
```

### Copyright notice
Edit `src/content/pages/copyright.md` to update your copyright information:
```markdown
Photos © Your name. All rights reserved.
```

### Features
Features are used to group photos by theme. Edit or create new files in `src/content/features/` folder:
```markdown
---
title: "Street"
images: []
---
```

You will also need to add the feature to the `features` collection in the CMS config (public/admin/config.yml)

## Next steps

Once you're comfortable with the basic setup, you might want to:
- Add more rolls
- Create features to highlight your best photos
- Add your own domain name through Netlify

For more advanced configuration options, check the main README.md file. 
import globalConfig from "../../global.config.yml";

const { default_lang: configDefaultLang } = globalConfig;


export const supportedLanguages = {
    en: 'English',
  };

export const defaultLang = configDefaultLang as keyof typeof supportedLanguages;

export type TranslationParams = {
  count?: number;
  total?: number;
  visible?: number;
  filters?: string;
  highlights?: string;
  tags?: string;
  camera?: string;
  film?: string;
  speed?: string;
  developer?: string;
  date?: string;
  location?: string;
  photographer?: string;
  format?: string;
  notes?: string;
  number?: number;
  alt?: string;
  username?: string;
  start?: string;
  end?: string;
  year?: string | number;
  title?: string;
};

export const ui = {
    en: {
      // Navigation
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.twitter': 'Twitter',

      // Start page (index)
      'start.viewAllRolls': 'View all {count} rolls',
      'start.randomRoll': 'Random roll',
      'start.highlightsTitle': 'Highlights',
      'start.viewAllHighlights': 'View all highlights',
      'start.rollsHeading': 'Latest film rolls',

      // Rolls index page
      'rolls.title': 'All film rolls',
      'rolls.allRolls': 'All {count} film rolls',
      'rolls.shotBetween': 'shot between {start} and {end}',
      'rolls.shotIn': 'shot in {year}',
      'rolls.latestRolls': 'Latest Rolls',
      'rolls.blackAndWhite': 'Black and White',
      'rolls.color': 'Color',
      'rolls.35mm': '35mm',
      'rolls.120': '120',
      'rolls.by': 'by',

      // Roll detail page
      'roll.info': 'Roll info',
      'roll.photos': 'Photos',
      'roll.comments': 'Comments',
      'roll.photoBy': 'Photos by',
      'roll.equipment': 'Equipment',
      'roll.equipmentDetail': '{camera} on {film}',
      'roll.seoDescription': 'A {format} film roll photographed by {photographer} with {camera} on {film} film {speed} {developer}, shot in {date} in {location}',
      'roll.filmSpeed': 'at ISO {speed}',
      'roll.developer': 'developed with {notes}',
      'roll.openFullscreen': 'open photo {number} in full screen',
      'roll.openFullscreenWithAlt': '{alt}, open photo in full screen',

      // Components
      'component.filmRollInfo.rollId': 'Roll ID',
      'component.filmRollInfo.camera': 'Camera',
      'component.filmRollInfo.lens': 'Lens',
      'component.filmRollInfo.lenses': 'Lenses',
      'component.filmRollInfo.film': 'Film',
      'component.filmRollInfo.developer': 'Developer',
      'component.filmRollInfo.shotDate': 'Shot date',
      'component.filmRollInfo.location': 'Location',
      'component.filmRollInfo.notes': 'Notes',
      'component.filmRollInfo.addComment': 'Add Comment',
      'component.filmRollInfo.tagRoll': 'Tag film roll',

      'component.footer.settings': 'Settings',
      'component.footer.copyright': 'Copyright notice',
      'component.footer.instagram': '{username} on Instagram',
      'component.footer.flickr': '{username} on Flickr',
      'component.footer.facebook': '{username} on Facebook',
      'component.footer.email': 'Send me an email',
      'component.footer.heading': 'About me',

      'component.commentDialog.title': 'Add comment',
      'component.commentDialog.name': 'Name',
      'component.commentDialog.email': 'Email',
      'component.commentDialog.comment': 'Comment',
      'component.commentDialog.cancel': 'Cancel',
      'component.commentDialog.submit': 'Submit',
      'component.commentDialog.tryAgain': 'Try Again',
      'component.commentDialog.dismiss': 'Dismiss',
      'component.commentDialog.success': 'Comment submitted successfully!',
      'component.commentDialog.successDetail': 'It will be reviewed before appearing on the site.',
      'component.commentDialog.viewOnGithub': 'View on GitHub →',
      'component.commentDialog.error': 'Error submitting comment:',

      'component.highlightDialog.title': 'Add to highlight',
      'component.highlightDialog.existingHighlights': 'Existing highlights: {highlights}',
      'component.highlightDialog.select': 'Select highlight',
      'component.highlightDialog.selectPlaceholder': 'Select a highlight...',
      'component.highlightDialog.cancel': 'Cancel',
      'component.highlightDialog.submit': 'Add to Highlight',
      'component.highlightDialog.tryAgain': 'Try Again',
      'component.highlightDialog.dismiss': 'Dismiss',
      'component.highlightDialog.loginRequired': 'You must be logged in to add highlights',
      'component.highlightDialog.success': 'Highlight added successfully! The change will be reviewed and applied soon.',
      'component.highlightDialog.error': 'Failed to add highlight',
      'component.highlightDialog.viewPR': 'View Pull Request →',

      'component.tagDialog.title': 'Tag film roll',
      'component.tagDialog.existingTags': 'Existing tags: {tags}',
      'component.tagDialog.select': 'Select tag',
      'component.tagDialog.selectPlaceholder': 'Select a tag...',
      'component.tagDialog.cancel': 'Cancel',
      'component.tagDialog.submit': 'Add tag',
      'component.tagDialog.tryAgain': 'Try again',
      'component.tagDialog.dismiss': 'Dismiss',
      'component.tagDialog.loginRequired': 'You must be logged in to add tags',
      'component.tagDialog.success': 'Tag added successfully! The change will be reviewed and applied soon.',
      'component.tagDialog.error': 'Failed to add tag',
      'component.tagDialog.viewPR': 'View Pull Request →',

      'component.header.backToFeatures': 'Back to features',
      'component.header.backToRolls': 'Back to rolls',
      'component.header.backToStart': 'Back to start',
      'component.header.search': 'Search',
      'component.header.showRollInfo': 'Show roll info',

      'component.rollCard.roll': 'Roll',
      'component.rollCard.tags': 'Tags',

      'component.darkMode.flash': 'Flash',
      'component.darkMode.noFlash': 'No flash',

      'component.filtering.title': 'Search and filter',
      'component.filtering.search': 'Search:',
      'component.filtering.searchPlaceholder': 'Search by camera, film, image motifs, format, title, etc.',
      'component.filtering.gridSize': 'Grid size:',
      'component.filtering.normalGrid': 'Normal grid',
      'component.filtering.compactGrid': 'Compact grid',
      'component.filtering.year': 'Year',
      'component.filtering.camera': 'Camera',
      'component.filtering.filmType': 'Film type',
      'component.filtering.film': 'Film',
      'component.filtering.format': 'Format',
      'component.filtering.location': 'Location',
      'component.filtering.tag': 'Tag',
      'component.filtering.showing': 'Showing {visible} of {total} rolls',
      'component.filtering.withFilters': 'with {count} active {filters}',

      'component.fullscreen.enabled': 'Fullscreen lightbox',
      'component.fullscreen.disabled': 'Normal lightbox',

      'component.highlightCard.viewHighlight': 'View highlight: {title}',
      'component.highlightCard.coverImage': 'Cover image for highlight: {title}',

      'component.iconButton.filtersActive': 'Filters active',

      'component.loggedInOnly.adminOnly': 'Admin-only content',

      'component.rollFilter.filterBy': 'Filter by',
      'component.sheet.close': 'Close',
    },
  } as const;

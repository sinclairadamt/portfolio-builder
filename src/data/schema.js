export const SCHEMA_VERSION = 2

export function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
}

export function createEmptyProject() {
  return {
    schemaVersion: SCHEMA_VERSION,
    siteSettings: {
      siteTitle: '',
      publishUrl: '',
      logoAssetId: null,
      colorPalette: {
        primary: '#0B5FFF',
        linkHover: '#0842B0',
        secondary: '#00B3A4',
        background: '#FFFFFF',
        text: '#1A1A1A',
      },
      fontPairId: 'poppins-inter',
      navStyle: 'top',
      galleryColumns: 3,
    },
    about: {
      photoAssetId: null,
      bio: '',
    },
    contact: {
      email: '',
      phone: '',
      location: { city: '', state: '' },
      socialLinks: [],
    },
    portfolio: {
      projects: [],
    },
    resume: {
      assetId: null,
    },
    assets: {},
  }
}

// Seam for future schema upgrades: bump SCHEMA_VERSION and add a case here
// that transforms `project` in place before it reaches the app.
export function migrateProject(rawProject) {
  if (!rawProject || typeof rawProject !== 'object') return createEmptyProject()
  const project = rawProject
  // v1 -> v2: categories were dropped in favor of a flat gallery. Pull every
  // project out of its category into one list rather than losing them.
  if (project.schemaVersion < 2 && project.portfolio?.categories) {
    project.portfolio = {
      projects: project.portfolio.categories.flatMap((category) => category.projects ?? []),
    }
  }
  if (project.schemaVersion < 2 && project.siteSettings && project.siteSettings.galleryColumns == null) {
    project.siteSettings.galleryColumns = 3
  }
  if (project.schemaVersion === SCHEMA_VERSION) return project
  project.schemaVersion = SCHEMA_VERSION
  return project
}

export function createProject(title = 'New Project') {
  return { id: createId('proj'), title, description: '', media: [] }
}

export function createImageMedia({ assetId, caption = '', altText = '' }) {
  return { id: createId('media'), type: 'image', assetId, caption, altText }
}

export function createYoutubeMedia({ youtubeId, caption = '' }) {
  return { id: createId('media'), type: 'youtube', youtubeId, caption }
}

export function createSocialLink(platform = 'linkedin', url = '') {
  return { platform, url }
}

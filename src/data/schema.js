export const SCHEMA_VERSION = 1

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
        secondary: '#00B3A4',
        background: '#FFFFFF',
        text: '#1A1A1A',
      },
      fontPairId: 'poppins-inter',
      navStyle: 'top',
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
      categories: [],
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
  if (project.schemaVersion === SCHEMA_VERSION) return project
  project.schemaVersion = SCHEMA_VERSION
  return project
}

export function createCategory(name = 'New Category') {
  return { id: createId('cat'), name, projects: [] }
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

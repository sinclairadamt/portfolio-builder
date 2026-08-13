import JSZip from 'jszip'
import { createEmptyProject, migrateProject } from '../data/schema.js'

const PROJECT_FILENAME = 'portfolio.json'
const ASSETS_DIRNAME = 'assets'

// In-memory ProjectStore for browsers without the File System Access API
// (Safari, Firefox) or as a portable/backup option anywhere. There is no real
// directory handle here -- durability comes from the student exporting a ZIP.
export class ZipProjectStore {
  #project = null
  #assets = new Map() // storedFilename -> Blob
  #assetUrlCache = new Map()

  mode = 'zip'

  get isConnected() {
    return this.#project !== null
  }

  newProject() {
    this.#project = createEmptyProject()
    this.#assets.clear()
    this.revokeAllAssetUrls()
    return this.#project
  }

  async importZip(file) {
    const zip = await JSZip.loadAsync(file)
    const projectEntry = zip.file(PROJECT_FILENAME)
    if (!projectEntry) {
      throw new Error('This does not look like a portfolio project ZIP (missing portfolio.json)')
    }

    const project = migrateProject(JSON.parse(await projectEntry.async('string')))
    const assets = new Map()
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir || !path.startsWith(`${ASSETS_DIRNAME}/`)) continue
      const storedFilename = path.slice(ASSETS_DIRNAME.length + 1)
      assets.set(storedFilename, await entry.async('blob'))
    }

    this.revokeAllAssetUrls()
    this.#project = project
    this.#assets = assets
    return this.#project
  }

  async loadProject() {
    return this.#project ?? this.newProject()
  }

  // In-memory only -- the student must call exportZip() to persist durably.
  async saveProject(project) {
    this.#project = project
  }

  async writeAsset(storedFilename, blob) {
    this.#assets.set(storedFilename, blob)
  }

  async readAssetUrl(storedFilename) {
    if (this.#assetUrlCache.has(storedFilename)) return this.#assetUrlCache.get(storedFilename)
    const blob = this.#assets.get(storedFilename)
    if (!blob) throw new Error(`Asset not found: ${storedFilename}`)
    const url = URL.createObjectURL(blob)
    this.#assetUrlCache.set(storedFilename, url)
    return url
  }

  async deleteAsset(storedFilename) {
    this.#assets.delete(storedFilename)
    const cached = this.#assetUrlCache.get(storedFilename)
    if (cached) {
      URL.revokeObjectURL(cached)
      this.#assetUrlCache.delete(storedFilename)
    }
  }

  revokeAllAssetUrls() {
    for (const url of this.#assetUrlCache.values()) URL.revokeObjectURL(url)
    this.#assetUrlCache.clear()
  }

  async exportZip() {
    if (!this.#project) throw new Error('No project to export')
    const zip = new JSZip()
    zip.file(PROJECT_FILENAME, JSON.stringify(this.#project, null, 2))
    const assetsFolder = zip.folder(ASSETS_DIRNAME)
    for (const [storedFilename, blob] of this.#assets) {
      assetsFolder.file(storedFilename, blob)
    }
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  }
}

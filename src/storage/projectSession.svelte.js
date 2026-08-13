import { supportsFileSystemAccess } from './capabilities.js'
import { FsaProjectStore } from './fsaProjectStore.js'
import { ZipProjectStore } from './zipProjectStore.js'

const AUTOSAVE_DEBOUNCE_MS = 1500

// Reactive session wrapper the editor UI talks to, regardless of which
// ProjectStore backend is active. Autosaves on a debounce; images are written
// immediately by callers via store.writeAsset() since that's a discrete action.
export class ProjectSession {
  store = $state(null)
  project = $state(null)
  connectionStatus = $state('none') // 'none' | 'connected' | 'needs-reconnect'
  connectionName = $state('')
  saveStatus = $state('idle') // 'idle' | 'saving' | 'saved' | 'error'
  errorMessage = $state('')

  #saveTimer = null

  get supportsFolderMode() {
    return supportsFileSystemAccess()
  }

  // Call once on app startup: looks for a remembered folder handle without
  // prompting. If it needs a fresh permission grant, connectionStatus becomes
  // 'needs-reconnect' and the UI should show a reconnect button (real user
  // gesture required -- can't be done automatically).
  async restore() {
    if (!this.supportsFolderMode) return
    const fsaStore = new FsaProjectStore()
    const result = await fsaStore.restoreLastSession()
    if (result.status === 'none') return

    this.store = fsaStore
    this.connectionStatus = result.status
    this.connectionName = result.name
    if (result.status === 'connected') {
      this.project = await fsaStore.loadProject()
    }
  }

  async reconnectFolder() {
    if (!(this.store instanceof FsaProjectStore)) return
    await this.store.reconnect()
    this.connectionStatus = 'connected'
    this.project = await this.store.loadProject()
  }

  async pickFolder() {
    const fsaStore = new FsaProjectStore()
    const { name } = await fsaStore.pickProjectDirectory()
    this.store = fsaStore
    this.connectionStatus = 'connected'
    this.connectionName = name
    this.project = await fsaStore.loadProject()
  }

  startZipProject() {
    const zipStore = new ZipProjectStore()
    this.store = zipStore
    this.project = zipStore.newProject()
    this.connectionStatus = 'connected'
    this.connectionName = 'Untitled project (ZIP mode)'
  }

  async importZip(file) {
    const zipStore = new ZipProjectStore()
    this.project = await zipStore.importZip(file)
    this.store = zipStore
    this.connectionStatus = 'connected'
    this.connectionName = file.name.replace(/\.zip$/i, '')
  }

  async exportZip() {
    if (!(this.store instanceof ZipProjectStore)) throw new Error('Not in ZIP mode')
    // Force a flush first -- exportZip() reads the store's own copy of the
    // project, which only syncs with the live (edited) object when the
    // debounced autosave fires. Without this, rapid edits followed by an
    // immediate export could silently ship stale data.
    await this.saveNow()
    return this.store.exportZip()
  }

  // Debounced autosave -- call after mutating session.project in place.
  scheduleSave() {
    if (!this.store) return
    clearTimeout(this.#saveTimer)
    this.saveStatus = 'saving'
    this.#saveTimer = setTimeout(() => this.#writeNow(), AUTOSAVE_DEBOUNCE_MS)
  }

  async saveNow() {
    clearTimeout(this.#saveTimer)
    await this.#writeNow()
  }

  async #writeNow() {
    if (!this.store || !this.project) return
    try {
      await this.store.saveProject(this.project)
      this.saveStatus = 'saved'
    } catch (err) {
      this.saveStatus = 'error'
      this.errorMessage = err.message
    }
  }
}

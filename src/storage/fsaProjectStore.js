import { createEmptyProject, migrateProject } from '../data/schema.js'
import { saveDirectoryHandle, loadDirectoryHandle, clearDirectoryHandle } from './handleDb.js'

const PROJECT_FILENAME = 'portfolio.json'
const ASSETS_DIRNAME = 'assets'

// Folder-mode ProjectStore backed by the File System Access API. Talks directly
// to a real directory on disk via a persisted FileSystemDirectoryHandle.
export class FsaProjectStore {
  #dirHandle = null
  #pendingHandle = null
  #assetUrlCache = new Map()

  mode = 'folder'

  // Call on app startup. Looks for a remembered handle from a previous session
  // without prompting -- reconnect() below is what actually re-requests permission,
  // since that requires a user gesture.
  async restoreLastSession() {
    const handle = await loadDirectoryHandle()
    if (!handle) return { status: 'none' }

    const permission = await handle.queryPermission({ mode: 'readwrite' })
    if (permission === 'granted') {
      this.#dirHandle = handle
      return { status: 'connected', name: handle.name }
    }

    this.#pendingHandle = handle
    return { status: 'needs-reconnect', name: handle.name }
  }

  // Must be called from a user gesture (e.g. a button click).
  async reconnect() {
    if (!this.#pendingHandle) throw new Error('No pending project folder to reconnect to')
    const permission = await this.#pendingHandle.requestPermission({ mode: 'readwrite' })
    if (permission !== 'granted') throw new Error('Permission to the project folder was denied')
    this.#dirHandle = this.#pendingHandle
    this.#pendingHandle = null
    return { name: this.#dirHandle.name }
  }

  // Must be called from a user gesture.
  async pickProjectDirectory() {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
    this.#dirHandle = handle
    await saveDirectoryHandle(handle)
    return { name: handle.name }
  }

  get isConnected() {
    return this.#dirHandle !== null
  }

  async forget() {
    this.#dirHandle = null
    this.#pendingHandle = null
    this.revokeAllAssetUrls()
    await clearDirectoryHandle()
  }

  async loadProject() {
    this.#assertConnected()
    try {
      const fileHandle = await this.#dirHandle.getFileHandle(PROJECT_FILENAME)
      const file = await fileHandle.getFile()
      return migrateProject(JSON.parse(await file.text()))
    } catch (err) {
      if (err.name === 'NotFoundError') {
        const empty = createEmptyProject()
        await this.saveProject(empty)
        return empty
      }
      throw err
    }
  }

  async saveProject(project) {
    this.#assertConnected()
    const fileHandle = await this.#dirHandle.getFileHandle(PROJECT_FILENAME, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(project, null, 2))
    await writable.close()
  }

  async writeAsset(storedFilename, blob) {
    this.#assertConnected()
    const assetsDir = await this.#dirHandle.getDirectoryHandle(ASSETS_DIRNAME, { create: true })
    const fileHandle = await assetsDir.getFileHandle(storedFilename, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(blob)
    await writable.close()
  }

  async readAssetUrl(storedFilename) {
    if (this.#assetUrlCache.has(storedFilename)) return this.#assetUrlCache.get(storedFilename)
    const file = await this.readAssetBlob(storedFilename)
    const url = URL.createObjectURL(file)
    this.#assetUrlCache.set(storedFilename, url)
    return url
  }

  // Raw bytes, for copying assets into a site export (as opposed to
  // readAssetUrl's blob: URL, meant for display in the editor/preview).
  async readAssetBlob(storedFilename) {
    this.#assertConnected()
    const assetsDir = await this.#dirHandle.getDirectoryHandle(ASSETS_DIRNAME, { create: true })
    const fileHandle = await assetsDir.getFileHandle(storedFilename)
    return fileHandle.getFile()
  }

  async deleteAsset(storedFilename) {
    this.#assertConnected()
    const assetsDir = await this.#dirHandle
      .getDirectoryHandle(ASSETS_DIRNAME, { create: false })
      .catch(() => null)
    if (assetsDir) await assetsDir.removeEntry(storedFilename).catch(() => {})
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

  #assertConnected() {
    if (!this.#dirHandle) throw new Error('No project folder connected')
  }
}

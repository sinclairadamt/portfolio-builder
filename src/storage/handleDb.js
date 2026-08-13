import { get, set, del } from 'idb-keyval'

// FileSystemDirectoryHandle is structured-clonable, so IndexedDB (via idb-keyval)
// is the standard place to remember it across sessions. It very often comes back
// with 'prompt' permission rather than 'granted' after a restart -- callers must
// treat reconnect as the normal case, not an edge case.
const HANDLE_KEY = 'lastProjectDirectoryHandle'

export async function saveDirectoryHandle(handle) {
  await set(HANDLE_KEY, handle)
}

export async function loadDirectoryHandle() {
  return (await get(HANDLE_KEY)) ?? null
}

export async function clearDirectoryHandle() {
  await del(HANDLE_KEY)
}

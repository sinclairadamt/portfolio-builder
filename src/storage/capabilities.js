export function supportsFileSystemAccess() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

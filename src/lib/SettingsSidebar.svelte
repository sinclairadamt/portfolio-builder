<script>
  import { FONT_PAIRS } from '../render/theme.js'
  import { ingestImageAsset, removeAsset } from '../media/assetRegistry.js'
  import MediaThumb from './MediaThumb.svelte'
  import ColorPickerField from './ColorPickerField.svelte'

  const COLLAPSED_STORAGE_KEY = 'portfolio-builder:settings-sidebar-collapsed'

  let { session } = $props()
  const settings = $derived(session.project.siteSettings)

  let collapsed = $state(readStoredCollapsed())

  function readStoredCollapsed() {
    try {
      return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  }

  $effect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed))
    } catch {
      // Private browsing / storage disabled -- the toggle still works for
      // this session, it just won't be remembered next time.
    }
  })

  function update() {
    session.scheduleSave()
  }

  function setColor(key, value) {
    settings.colorPalette[key] = value
    update()
  }

  async function onLogoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const previousAssetId = settings.logoAssetId
    settings.logoAssetId = await ingestImageAsset(session.store, session.project, file, {
      keepTransparency: true,
    })
    if (previousAssetId) await removeAsset(session.store, session.project, previousAssetId)
    update()
    event.target.value = ''
  }
</script>

<aside class="sidebar" class:collapsed>
  <button class="toggle" onclick={() => (collapsed = !collapsed)} aria-label={collapsed ? 'Expand settings' : 'Collapse settings'}>
    {collapsed ? '»' : '«'}
  </button>

  {#if !collapsed}
    <div class="sidebar-content">
      <h2>Site Settings</h2>

      <label for="site-title">Site Title</label>
      <input
        id="site-title"
        value={settings.siteTitle}
        oninput={(e) => {
          settings.siteTitle = e.target.value
          update()
        }}
      />

      <label for="publish-url">Publish URL</label>
      <input
        id="publish-url"
        value={settings.publishUrl}
        placeholder="https://username.github.io/repo-name/"
        oninput={(e) => {
          settings.publishUrl = e.target.value
          update()
        }}
      />

      <label for="logo">Logo</label>
      {#if settings.logoAssetId}
        <MediaThumb {session} assetId={settings.logoAssetId} />
      {/if}
      <input id="logo" type="file" accept="image/*" onchange={onLogoChange} />

      <ColorPickerField
        label="Background Color"
        id="background-color"
        value={settings.colorPalette.background}
        onChange={(v) => setColor('background', v)}
      />
      <ColorPickerField
        label="Text Color"
        id="text-color"
        value={settings.colorPalette.text}
        onChange={(v) => setColor('text', v)}
      />
      <ColorPickerField
        label="Link &amp; Button Color"
        id="primary-color"
        value={settings.colorPalette.primary}
        onChange={(v) => setColor('primary', v)}
      />
      <ColorPickerField
        label="Link Hover Color"
        id="link-hover-color"
        value={settings.colorPalette.linkHover}
        onChange={(v) => setColor('linkHover', v)}
      />
      <ColorPickerField
        label="Accent Line Color"
        id="secondary-color"
        value={settings.colorPalette.secondary}
        onChange={(v) => setColor('secondary', v)}
      />

      <label for="font-pair">Fonts</label>
      <select
        id="font-pair"
        value={settings.fontPairId}
        onchange={(e) => {
          settings.fontPairId = e.target.value
          update()
        }}
      >
        {#each Object.entries(FONT_PAIRS) as [id, pair] (id)}
          <option value={id}>{pair.label}</option>
        {/each}
      </select>
    </div>
  {/if}
</aside>

<style>
  .sidebar {
    position: relative;
    width: 280px;
    flex-shrink: 0;
    border-right: 1px solid var(--border);
    padding: 1rem;
    box-sizing: border-box;
  }

  .sidebar.collapsed {
    width: 40px;
    padding: 1rem 0.25rem;
  }

  .toggle {
    padding: 0.3rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 500;
    margin-top: 0.5rem;
  }

  input,
  select {
    font: inherit;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
  }
</style>

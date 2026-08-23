<script>
  import { FONT_PAIRS, GALLERY_ASPECT_RATIO_PRESETS } from '../render/theme.js'
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

  function setCustomRatioDimension(dimension, rawValue) {
    const value = Number(rawValue)
    if (!(value > 0)) return
    // Projects saved before this field existed won't have it yet.
    settings.galleryAspectRatioCustom ??= { width: 4, height: 3 }
    settings.galleryAspectRatioCustom[dimension] = value
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
      <h2>Settings &amp; Design</h2>

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

      <label class="checkbox-row">
        <input
          type="checkbox"
          checked={settings.showLogoInHeader !== false}
          onchange={(e) => {
            settings.showLogoInHeader = e.target.checked
            update()
          }}
        />
        Show logo in header (still used as favicon either way)
      </label>

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

      <label class="checkbox-row">
        <input
          type="checkbox"
          checked={settings.showAccentLine !== false}
          onchange={(e) => {
            settings.showAccentLine = e.target.checked
            update()
          }}
        />
        Show accent line under portfolio title
      </label>

      <label for="gallery-columns">Gallery Columns</label>
      <input
        id="gallery-columns"
        type="number"
        min="1"
        max="6"
        value={settings.galleryColumns}
        oninput={(e) => {
          const value = Number(e.target.value)
          if (!Number.isInteger(value) || value < 1 || value > 6) return
          settings.galleryColumns = value
          update()
        }}
      />

      <label for="gallery-aspect-ratio">Gallery Image/Video Shape</label>
      <select
        id="gallery-aspect-ratio"
        value={settings.galleryAspectRatio}
        onchange={(e) => {
          settings.galleryAspectRatio = e.target.value
          update()
        }}
      >
        {#each Object.entries(GALLERY_ASPECT_RATIO_PRESETS) as [id, preset] (id)}
          <option value={id}>{preset.label}</option>
        {/each}
      </select>

      {#if settings.galleryAspectRatio === 'custom'}
        <div class="custom-ratio-row">
          <input
            type="number"
            min="0.1"
            step="0.1"
            aria-label="Custom aspect ratio width"
            value={settings.galleryAspectRatioCustom?.width ?? 4}
            oninput={(e) => setCustomRatioDimension('width', e.target.value)}
          />
          <span>:</span>
          <input
            type="number"
            min="0.1"
            step="0.1"
            aria-label="Custom aspect ratio height"
            value={settings.galleryAspectRatioCustom?.height ?? 3}
            oninput={(e) => setCustomRatioDimension('height', e.target.value)}
          />
        </div>
      {/if}

      <label for="title-align">Title Alignment</label>
      <select
        id="title-align"
        value={settings.titleAlign || 'left'}
        onchange={(e) => {
          settings.titleAlign = e.target.value
          update()
        }}
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
      </select>

      <label for="description-align">Description Alignment</label>
      <select
        id="description-align"
        value={settings.descriptionAlign || 'left'}
        onchange={(e) => {
          settings.descriptionAlign = e.target.value
          update()
        }}
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
      </select>

      <label for="caption-align">Caption Alignment</label>
      <select
        id="caption-align"
        value={settings.captionAlign || 'left'}
        onchange={(e) => {
          settings.captionAlign = e.target.value
          update()
        }}
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
      </select>

      <label for="nav-style">Hamburger Menu</label>
      <select
        id="nav-style"
        value={settings.navStyle === 'always' ? 'always' : 'mobile-only'}
        onchange={(e) => {
          settings.navStyle = e.target.value
          update()
        }}
      >
        <option value="mobile-only">Mobile only</option>
        <option value="always">Always</option>
      </select>

      <ColorPickerField
        label="Menu Gradient Top Color"
        id="menu-gradient-top"
        value={settings.colorPalette.menuGradientTop || settings.colorPalette.secondary}
        onChange={(v) => setColor('menuGradientTop', v)}
      />
      <ColorPickerField
        label="Menu Gradient Bottom Color"
        id="menu-gradient-bottom"
        value={settings.colorPalette.menuGradientBottom || settings.colorPalette.primary}
        onChange={(v) => setColor('menuGradientBottom', v)}
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

  .custom-ratio-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .custom-ratio-row input {
    width: 0; /* let flex:1-like sizing come from the flex-basis below */
    flex: 1;
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 400;
  }

  .checkbox-row input {
    width: auto;
    flex-shrink: 0;
  }
</style>

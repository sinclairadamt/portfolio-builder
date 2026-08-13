<script>
  import { COLOR_PRESETS, FONT_PAIRS } from '../../render/theme.js'
  import { ingestImageAsset, removeAsset } from '../../media/assetRegistry.js'
  import MediaThumb from '../MediaThumb.svelte'
  import PreviewPane from '../PreviewPane.svelte'

  let { session } = $props()
  const settings = $derived(session.project.siteSettings)

  function update() {
    session.scheduleSave()
  }

  function applyPreset(presetId) {
    const preset = COLOR_PRESETS[presetId]
    if (!preset) return
    settings.colorPalette = { presetId, ...preset }
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

<div class="screen">
  <div class="form-pane">
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

    <label for="tagline">Tagline</label>
    <input
      id="tagline"
      value={settings.tagline}
      oninput={(e) => {
        settings.tagline = e.target.value
        update()
      }}
    />

    <label for="publish-url">Publish URL (optional)</label>
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

    <label for="palette">Color Palette</label>
    <div id="palette" class="palette-options">
      {#each Object.entries(COLOR_PRESETS) as [id, preset] (id)}
        <button
          class="palette-swatch"
          class:selected={settings.colorPalette.presetId === id}
          style="background:{preset.primary}"
          onclick={() => applyPreset(id)}
          aria-label={id}
          title={id}
        ></button>
      {/each}
    </div>

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

  <PreviewPane {session} pageKey="home" />
</div>

<style>
  .screen {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .form-pane {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 280px;
    flex: 1;
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
  }

  .palette-options {
    display: flex;
    gap: 0.5rem;
  }

  .palette-swatch {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .palette-swatch.selected {
    border-color: #1a1a1a;
  }
</style>

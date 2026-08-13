<script>
  import { FONT_PAIRS } from '../../render/theme.js'
  import { ingestImageAsset, removeAsset } from '../../media/assetRegistry.js'
  import MediaThumb from '../MediaThumb.svelte'
  import ColorPickerField from '../ColorPickerField.svelte'
  import PreviewPane from '../PreviewPane.svelte'

  let { session } = $props()
  const settings = $derived(session.project.siteSettings)

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

  <PreviewPane {session} pageKey="home" />
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-pane {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 500px;
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
</style>

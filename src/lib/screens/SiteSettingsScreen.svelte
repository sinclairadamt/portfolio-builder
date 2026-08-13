<script>
  import { untrack } from 'svelte'
  import { FONT_PAIRS } from '../../render/theme.js'
  import { ingestImageAsset, removeAsset } from '../../media/assetRegistry.js'
  import MediaThumb from '../MediaThumb.svelte'
  import PreviewPane from '../PreviewPane.svelte'

  const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

  let { session } = $props()
  const settings = $derived(session.project.siteSettings)

  // Local, freely-typeable copies of the hex fields -- can't bind these
  // directly to settings.colorPalette.* or every keystroke of an
  // incomplete/invalid hex code would get overwritten back to the last valid
  // value. Only a valid hex code gets committed back to the project.
  let primaryHexInput = $state(untrack(() => settings.colorPalette.primary))
  let secondaryHexInput = $state(untrack(() => settings.colorPalette.secondary))

  $effect(() => {
    primaryHexInput = settings.colorPalette.primary
  })
  $effect(() => {
    secondaryHexInput = settings.colorPalette.secondary
  })

  function update() {
    session.scheduleSave()
  }

  function onPrimaryColorPicked(e) {
    settings.colorPalette.primary = e.target.value
    primaryHexInput = e.target.value
    update()
  }

  function onPrimaryHexTyped(e) {
    primaryHexInput = e.target.value
    if (HEX_COLOR_RE.test(primaryHexInput)) {
      settings.colorPalette.primary = primaryHexInput
      update()
    }
  }

  function onSecondaryColorPicked(e) {
    settings.colorPalette.secondary = e.target.value
    secondaryHexInput = e.target.value
    update()
  }

  function onSecondaryHexTyped(e) {
    secondaryHexInput = e.target.value
    if (HEX_COLOR_RE.test(secondaryHexInput)) {
      settings.colorPalette.secondary = secondaryHexInput
      update()
    }
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

    <label for="primary-color">Link &amp; Button Color</label>
    <div class="color-input-row">
      <input id="primary-color" type="color" value={settings.colorPalette.primary} oninput={onPrimaryColorPicked} />
      <input class="hex-input" value={primaryHexInput} oninput={onPrimaryHexTyped} />
    </div>

    <label for="secondary-color">Accent Line Color</label>
    <div class="color-input-row">
      <input
        id="secondary-color"
        type="color"
        value={settings.colorPalette.secondary}
        oninput={onSecondaryColorPicked}
      />
      <input class="hex-input" value={secondaryHexInput} oninput={onSecondaryHexTyped} />
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

  .color-input-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  input[type='color'] {
    padding: 0.2rem;
    width: 48px;
    height: 40px;
  }

  .hex-input {
    width: 120px;
  }
</style>

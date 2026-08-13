<script>
  import { ingestImageAsset, ingestRawAsset, removeAsset } from '../../media/assetRegistry.js'
  import MediaThumb from '../MediaThumb.svelte'
  import PreviewPane from '../PreviewPane.svelte'

  let { session } = $props()
  const about = $derived(session.project.about)

  function update() {
    session.scheduleSave()
  }

  async function onPhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const previousAssetId = about.photoAssetId
    about.photoAssetId = await ingestImageAsset(session.store, session.project, file)
    if (previousAssetId) await removeAsset(session.store, session.project, previousAssetId)
    update()
    event.target.value = ''
  }

  async function onResumeChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const previousAssetId = session.project.resume.assetId
    session.project.resume.assetId = await ingestRawAsset(session.store, session.project, file)
    if (previousAssetId) await removeAsset(session.store, session.project, previousAssetId)
    update()
    event.target.value = ''
  }

  async function removeResume() {
    const assetId = session.project.resume.assetId
    if (!assetId) return
    await removeAsset(session.store, session.project, assetId)
    session.project.resume.assetId = null
    update()
  }
</script>

<div class="screen">
  <div class="form-pane">
    <h2>About</h2>

    <label for="photo">Photo</label>
    {#if about.photoAssetId}
      <MediaThumb {session} assetId={about.photoAssetId} />
    {/if}
    <input id="photo" type="file" accept="image/*" onchange={onPhotoChange} />

    <label for="bio">Bio</label>
    <textarea
      id="bio"
      rows="8"
      value={about.bio}
      oninput={(e) => {
        about.bio = e.target.value
        update()
      }}
    ></textarea>

    <label for="resume">Resume (PDF)</label>
    {#if session.project.resume.assetId}
      <p class="resume-status">
        {session.project.assets[session.project.resume.assetId]?.originalFilename}
        <button onclick={removeResume}>Remove</button>
      </p>
    {/if}
    <input id="resume" type="file" accept="application/pdf" onchange={onResumeChange} />
  </div>

  <PreviewPane {session} pageKey="about" />
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

  textarea,
  input {
    font: inherit;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .resume-status {
    font-size: 0.9rem;
  }
</style>

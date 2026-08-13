<script>
  let { session, assetId } = $props()
  let url = $state('')

  $effect(() => {
    const entry = assetId ? session.project.assets[assetId] : null
    if (!entry) {
      url = ''
      return
    }
    session.store.readAssetUrl(entry.storedFilename).then((resolved) => (url = resolved))
  })
</script>

{#if url}
  <img class="media-thumb" src={url} alt="" />
{/if}

<style>
  .media-thumb {
    max-width: 160px;
    max-height: 160px;
    border-radius: 6px;
    object-fit: cover;
  }
</style>

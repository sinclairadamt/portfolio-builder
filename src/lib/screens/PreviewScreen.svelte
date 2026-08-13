<script>
  import PreviewPane from '../PreviewPane.svelte'

  let { session } = $props()
</script>

<div class="preview-screen">
  <PreviewPane {session} pageKey="home" minHeight="80vh" />
</div>

<style>
  .preview-screen {
    display: flex;
    flex-direction: column;
  }
</style>

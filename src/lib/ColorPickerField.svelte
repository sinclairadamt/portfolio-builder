<script>
  import { untrack } from 'svelte'

  const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

  let { label, id, value, onChange } = $props()

  // Local, freely-typeable copy of the hex text -- can't bind the text input
  // directly to `value`, or every keystroke of an incomplete/invalid hex
  // code would get overwritten back to the last valid value.
  let hexInput = $state(untrack(() => value))

  $effect(() => {
    hexInput = value
  })

  function onPicked(e) {
    hexInput = e.target.value
    onChange(e.target.value)
  }

  function onTyped(e) {
    hexInput = e.target.value
    if (HEX_COLOR_RE.test(hexInput)) onChange(hexInput)
  }
</script>

<label for={id}>{label}</label>
<div class="color-input-row">
  <input {id} type="color" {value} oninput={onPicked} />
  <input class="hex-input" value={hexInput} oninput={onTyped} />
</div>

<style>
  .color-input-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  input[type='color'] {
    padding: 0.2rem;
    width: 48px;
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .hex-input {
    width: 120px;
    font: inherit;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
</style>

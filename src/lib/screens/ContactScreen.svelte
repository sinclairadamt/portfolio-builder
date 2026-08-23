<script>
  import { createSocialLink } from '../../data/schema.js'
  import PreviewPane from '../PreviewPane.svelte'

  let { session } = $props()
  const contact = $derived(session.project.contact)

  function update() {
    session.scheduleSave()
  }

  function addLink() {
    contact.socialLinks.push(createSocialLink('linkedin', ''))
    update()
  }

  function removeLink(index) {
    contact.socialLinks.splice(index, 1)
    update()
  }

  function moveLink(index, delta) {
    const target = index + delta
    if (target < 0 || target >= contact.socialLinks.length) return
    const [item] = contact.socialLinks.splice(index, 1)
    contact.socialLinks.splice(target, 0, item)
    update()
  }
</script>

<div class="screen">
  <div class="form-pane">
    <h2>Contact</h2>

    <label for="email">Email</label>
    <input
      id="email"
      type="email"
      value={contact.email}
      oninput={(e) => {
        contact.email = e.target.value
        update()
      }}
    />

    <label for="phone">Phone</label>
    <input
      id="phone"
      type="tel"
      value={contact.phone}
      oninput={(e) => {
        contact.phone = e.target.value
        update()
      }}
    />

    <label for="city">City</label>
    <input
      id="city"
      value={contact.location.city}
      oninput={(e) => {
        contact.location.city = e.target.value
        update()
      }}
    />

    <label for="state">State</label>
    <input
      id="state"
      value={contact.location.state}
      oninput={(e) => {
        contact.location.state = e.target.value
        update()
      }}
    />

    <h3>Social Links</h3>
    {#each contact.socialLinks as link, index (index)}
      <div class="social-link-row">
        <input
          class="platform-input"
          placeholder="platform (e.g. linkedin)"
          value={link.platform}
          oninput={(e) => {
            link.platform = e.target.value
            update()
          }}
        />
        <input
          class="url-input"
          placeholder="https://..."
          value={link.url}
          oninput={(e) => {
            link.url = e.target.value
            update()
          }}
        />
        <button onclick={() => moveLink(index, -1)} disabled={index === 0}>&uarr;</button>
        <button onclick={() => moveLink(index, 1)} disabled={index === contact.socialLinks.length - 1}>
          &darr;
        </button>
        <button onclick={() => removeLink(index)}>Remove</button>
      </div>
    {/each}
    <button onclick={addLink}>+ Add Link</button>

    <label class="checkbox-row">
      <input
        type="checkbox"
        checked={contact.useIcons === true}
        onchange={(e) => {
          contact.useIcons = e.target.checked
          update()
        }}
      />
      Use icons for social links instead of text
    </label>
  </div>

  <PreviewPane {session} pageKey="contact" />
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

  input {
    font: inherit;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .social-link-row {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }

  .platform-input {
    width: 140px;
  }

  .url-input {
    flex: 1;
  }

  button {
    padding: 0.4rem 0.7rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 400;
  }

  .checkbox-row input {
    width: auto;
  }
</style>

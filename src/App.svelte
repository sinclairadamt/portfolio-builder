<script>
  // No client-side router: GitHub Pages doesn't rewrite unknown paths to index.html,
  // so navigation is plain in-memory view state, not URL routes.
  const sections = ['About', 'Contact', 'Portfolio', 'Site Settings']
  let activeSection = $state('Portfolio')
</script>

<div class="app-shell">
  <header>
    <h1>Portfolio Builder</h1>
    <nav>
      {#each sections as section}
        <button
          class:active={activeSection === section}
          onclick={() => (activeSection = section)}
        >
          {section}
        </button>
      {/each}
    </nav>
  </header>

  <main>
    <p>Editor scaffold is live. {activeSection} screen goes here.</p>
  </main>
</div>

<style>
  .app-shell {
    max-width: 960px;
    margin: 0 auto;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem 0;
  }

  nav {
    display: flex;
    gap: 0.5rem;
  }

  nav button {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
  }

  nav button.active {
    background: #1a1a1a;
    color: white;
    border-color: #1a1a1a;
  }

  main {
    padding: 2rem 0;
  }
</style>

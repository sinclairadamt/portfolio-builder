<script>
  // No client-side router: GitHub Pages doesn't rewrite unknown paths to index.html,
  // so navigation is plain in-memory view state, not URL routes.
  import { ProjectSession } from './storage/projectSession.svelte.js'
  import ConnectionBar from './lib/ConnectionBar.svelte'
  import SettingsSidebar from './lib/SettingsSidebar.svelte'
  import AboutScreen from './lib/screens/AboutScreen.svelte'
  import ContactScreen from './lib/screens/ContactScreen.svelte'
  import PortfolioScreen from './lib/screens/PortfolioScreen.svelte'
  import PreviewScreen from './lib/screens/PreviewScreen.svelte'
  import PublishScreen from './lib/screens/PublishScreen.svelte'

  const sections = ['Portfolio', 'About', 'Contact', 'Preview', 'Publish']
  let activeSection = $state('Portfolio')
  let session = $state(new ProjectSession())

  session.restore()
</script>

<div class="layout">
  {#if session.project}
    <SettingsSidebar {session} />
  {/if}

  <div class="app-shell">
    <header>
      <h1>Portfolio Builder</h1>
      <nav>
        {#each sections as section}
          <button class:active={activeSection === section} onclick={() => (activeSection = section)}>
            {section}
          </button>
        {/each}
      </nav>
    </header>

    <main>
      <ConnectionBar {session} />

      {#if !session.project}
        <p class="empty-state">
          Choose a project folder or start/import a ZIP project above to begin editing.
        </p>
      {:else if activeSection === 'About'}
        <AboutScreen {session} />
      {:else if activeSection === 'Contact'}
        <ContactScreen {session} />
      {:else if activeSection === 'Portfolio'}
        <PortfolioScreen {session} />
      {:else if activeSection === 'Preview'}
        <PreviewScreen {session} />
      {:else if activeSection === 'Publish'}
        <PublishScreen {session} />
      {/if}
    </main>
  </div>
</div>

<style>
  .layout {
    display: flex;
    /* default (stretch) align-items so the sidebar's right border runs the
       full height of the content beside it, like a real persistent panel */
    min-height: 100vh;
  }

  .app-shell {
    flex: 1;
    min-width: 0;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
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
    padding: 1.5rem 0 3rem;
  }

  .empty-state {
    opacity: 0.7;
  }
</style>

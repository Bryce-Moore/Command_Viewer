<script>
  // Get the current host name
  const currentHostName = window.location.hostname;

  // Get channel name
  var channelName = ''
  // @ts-ignore
  window.Twitch.ext.onAuthorized(function(auth) {
      channelName = auth.channelId
  });

  async function getCommands() {
    const response = await fetch(`/commands?hostname=${currentHostName}&channelname=${channelName}`);
    const commands = await response.json();
    return commands
  }

  let promise = getCommands()

  const refreshButton = document.getElementById('refresh-button')
  refreshButton.addEventListener('click', () => {
    window.location.reload();
  })
</script>

<header>
  <h2>Command Viewer</h2>
  <button id="refresh-button">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>    
  </button>
</header>

<main>
  {#await promise} 
    <!-- promise is pending -->
    <p>Fetching {channelName}'s commands...</p>
  {:then commands}
    <!-- promise was fulfilled -->
    <ul>
      {#each commands as command}
        <li>
          <details>
            <summary id="command-name"><b>{command.name}</b></summary>
            <p id="command-message">{command.message}</p>
          </details>  
        </li>
      {/each}
    </ul>
  {:catch}
    <!-- promise was rejected -->
    <p> An uh-oh occurred when fetching {channelName}'s commands</p>
  {/await} 
</main>

<style>
  ul {
    list-style-type: none;
  }

  svg, #refresh-button {
    width: 60px;
  }
</style>
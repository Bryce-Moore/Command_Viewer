<script>
    const authorizeButton = document.getElementById('authorize-button');
    const revokeButton = document.getElementById('remove-auth-button');

    // Get the current host name
    const currentHostName = window.location.hostname;

    var channelName = ''
    // @ts-ignore
    window.Twitch.ext.onAuthorized(function(auth) {
        channelName = auth.channelId
    });
    
    authorizeButton.addEventListener('click', () => {
        // Redirect the user to the authorization route on your server, passing the redirect URI as a query parameter
        window.location.href = `/authorize?hostname=${currentHostName}&channelname=${channelName}`;
    });

    revokeButton.addEventListener('click', () => {
        // Redirect the user to the authorization route on your server
        window.location.href = `/revoke?hostname=${currentHostName}&channelname=${channelName}`;
        alert("Permissions have been revoked from the extension and your channel has been removed from the database.")
    });
</script>

<main>
    <p>For the extension to work, you'll have to grant it permission to view your channel's custom commands from the nightbot website.</p>
    <div>
        <button id="authorize-button">Authorize</button>
        <button id="remove-auth-button">Revoke permissions</button>
    </div>
</main>

// Module Name: foundry-element-chat

Hooks.on("init", () => {
  // Register a setting for the webhook URL (optional, but recommended)
  game.settings.register("foundry-element-chat", "webhookUrl", {
    name: "Webhook URL",
    hint: "The URL of your n8n webhook endpoint (e.g., http://your-server-ip:5678/webhook/foundry-chat)",
    scope: "world", // Make it a world-level setting
    type: String,
    default: "", // Default value
    config: true // Show it in module settings
  });
});


Hooks.on("ChatMessage", (message) => {
  // Get the webhook URL from settings
  const webhookUrl = game.settings.get("foundry-element-chat", "webhookUrl");

  // Check if the webhook URL is set
  if (!webhookUrl) {
    ui.notifications.warn("Webhook URL not configured for Foundry Element Chat module.");
    return; // Don't send the webhook if the URL is not set
  }

  // Construct the payload
  const payload = {
    user: {
      id: message.user.id,
      name: message.user.name,
      // Add other user information if needed
    },
    content: message.content,
    // Add other relevant message data (timestamp, flags, etc.)
    timestamp: message.timestamp, // Include the timestamp for deduplication if needed.
    messageId: message.id // Include the message id for deduplication if needed.
  };

  // Send the webhook
  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // Important: tell n8n it's JSON
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) { // Check for HTTP errors
        console.error("Error sending webhook to n8n:", response.status, response.statusText);
        ui.notifications.error(`Error sending chat to Element: ${response.status}`); // Notify the GM
      } // else, all is good
    })
    .catch(error => {
      console.error("Error sending webhook to n8n:", error);
      ui.notifications.error("Error sending chat to Element. Check console for details."); // Notify the GM
    });
});
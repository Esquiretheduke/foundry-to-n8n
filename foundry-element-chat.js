Hooks.on("ready", () => { // Use the "ready" hook instead of "init"

  game.settings.register("foundry-element-chat", "webhookUrl", {
    name: "Webhook URL",
    hint: "The URL of your n8n webhook endpoint (e.g., http://your-server-ip:5678/webhook/foundry-chat)",
    scope: "world",
    type: String,
    default: "",
    config: true
  });

  Hooks.on("ChatMessage", (message) => {
    const webhookUrl = game.settings.get("foundry-element-chat", "webhookUrl");

    if (!webhookUrl) {
      ui.notifications.warn("Webhook URL not configured for Foundry Element Chat module.");
      return;
    }

    const user = message.user;
    let userName = "System";
    let userId = null;

    if (user) {
      userName = user.name;
      userId = user.id;
    } else {
      console.warn("Message sent by system or deleted user:", message);
    }

    const payload = {
      user: {
        id: userId,
        name: userName,
      },
      content: message.content,
      timestamp: message.timestamp,
      messageId: message.id
    };


    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
          console.error("Error sending webhook to n8n:", response.status, response.statusText);
          ui.notifications.error(`Error sending chat to Element: ${response.status}`);
        }
      })
    .catch(error => {
        console.error("Error sending webhook to n8n:", error);
        ui.notifications.error("Error sending chat to Element. Check console for details.");
      });
  });
}); // End of the "ready" hook
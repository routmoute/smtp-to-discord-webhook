# smtp-to-discord-webhook
A simple smtp to discord webhook relay

## Examples

### Docker run
```sh
docker run -d -p 1025:25 \
    -e DISCORD_WEBHOOK_URL=YourDiscordWebhookUrl \
    -e SMTP_USERNAME=username \
    -e SMTP_PASSWORD=password \
    routmoute/smtp-to-discord-webhook
```

### Docker-compose
```yaml
version: "3.8"
services:
  smtp-to-discord-webhook:
    image: routmoute/smtp-to-discord-webhook
    environment:
      DISCORD_WEBHOOK_URL: YourDiscordWebhookUrl
      SMTP_USERNAME: username
      SMTP_PASSWORD: password
    ports:
      - "1025:25"
```

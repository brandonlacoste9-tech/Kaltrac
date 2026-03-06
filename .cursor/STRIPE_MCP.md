# Stripe MCP in this project

This workspace is configured to use **Stripe’s MCP server** so Cursor can call Stripe tools (create customers, payment links, subscriptions, search docs, etc.) while you work.

## Current config (remote, OAuth)

- **File:** `.cursor/mcp.json`
- **Server:** `https://mcp.stripe.com`
- **Auth:** When you first use Stripe in Cursor, you’ll be prompted to sign in with Stripe (OAuth). No API key is stored in the repo.

After adding or changing this config, **restart Cursor** so it picks up the MCP server.

## Optional: local MCP with API key

If you prefer to use your Stripe secret key instead of OAuth (e.g. for a specific Stripe account or key), replace the `stripe` entry in `.cursor/mcp.json` with:

```json
"stripe": {
  "command": "npx",
  "args": ["-y", "@stripe/mcp@latest"],
  "env": {
    "STRIPE_SECRET_KEY": "sk_test_..."
  }
}
```

**Do not commit real keys.** Use an env var or a local override that’s gitignored.

## Links

- [Stripe MCP docs](https://docs.stripe.com/mcp)
- [Cursor MCP docs](https://docs.cursor.com/context/model-context-protocol)

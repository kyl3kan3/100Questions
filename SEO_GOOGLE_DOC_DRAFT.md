# How to Check If OAI-SearchBot Is Blocked

If your website is missing from ChatGPT search results, the first technical question is whether OAI-SearchBot can access it. OAI-SearchBot is the OpenAI crawler used to help discover and surface public web content in ChatGPT search experiences.

You can check the main technical signals—including OAI-SearchBot rules—with the [free AI visibility checker](https://100questionsai.com/ai-visibility-checker). It requires no account and does not use paid AI credits.

## What is OAI-SearchBot?

OAI-SearchBot is distinct from GPTBot.

- **OAI-SearchBot** helps OpenAI discover public content that may appear in ChatGPT search results.
- **GPTBot** crawls content that may be used to improve OpenAI’s generative AI models.
- **ChatGPT-User** may visit a page when a user asks ChatGPT to open or interact with it.

Blocking one crawler does not automatically block the others. OpenAI’s [publisher guidance](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) says publishers who want their content included in ChatGPT summaries and snippets should make sure OAI-SearchBot is not blocked.

Allowing the crawler does not guarantee a citation, ranking, recommendation, or visit. It only removes one possible technical barrier.

## How to check if OAI-SearchBot is blocked

### 1. Open your robots.txt file

Visit:

`https://yourdomain.com/robots.txt`

Replace `yourdomain.com` with your real domain. The file should load publicly without a login.

Search for `OAI-SearchBot`. A full-site block usually looks like this:

```text
User-agent: OAI-SearchBot
Disallow: /
```

The slash means the crawler is disallowed from the entire site.

### 2. Check the wildcard rules

If robots.txt has no group specifically for OAI-SearchBot, the crawler may follow the wildcard group:

```text
User-agent: *
Disallow: /
```

That rule blocks all crawlers that do not have a more specific applicable group.

The [Robots Exclusion Protocol](https://www.rfc-editor.org/info/rfc9309/) defines how crawlers match user-agent groups and `Allow` or `Disallow` paths. Specific rules and path matching can be easy to misread, so checking only for the crawler’s name is not always enough.

### 3. Test the exact page you want ChatGPT to find

A crawler may be allowed on the homepage but blocked from a directory such as:

```text
User-agent: OAI-SearchBot
Disallow: /blog/
```

In that example, the homepage may be accessible while every URL under `/blog/` is blocked. Test the exact page—not just the domain.

The [100 Questions AI visibility checker](https://100questionsai.com/ai-visibility-checker) analyzes robots.txt for full-site blocks affecting OAI-SearchBot, GPTBot, ClaudeBot, and PerplexityBot. It also checks indexability, metadata, headings, canonical tags, structured data, sitemap discovery, question-oriented content, and `llms.txt`.

### 4. Check your CDN or firewall

An allowed robots.txt rule does not prove that the crawler can fetch the page. A content delivery network, web application firewall, bot-protection service, or hosting rule may still return an error or challenge page.

OpenAI’s [crawler guidance](https://help.openai.com/en/articles/20001243-advertiser-guidance-for-allowing-openai-web-crawlers) recommends checking both robots.txt and web-protection layers. Review server or CDN logs for requests from the crawler and confirm the requested page returns its normal public content.

## How to allow OAI-SearchBot

If you intentionally want to permit the crawler, a simple group can look like this:

```text
User-agent: OAI-SearchBot
Allow: /
```

Do not paste this blindly. Existing path-specific rules, duplicate user-agent groups, redirects, authentication, legal requirements, or security policies may change the correct configuration.

Robots.txt is a crawling preference, not an access-control system. Sensitive or private content should be protected with authentication and other real security controls rather than robots.txt.

## Common mistakes

- **Confusing GPTBot with OAI-SearchBot.** They have different documented purposes.
- **Checking only the homepage.** A path-specific rule may block the page that matters.
- **Ignoring wildcard rules.** `User-agent: *` may apply when there is no specific group.
- **Assuming “allowed” means “will rank.”** Access is necessary for crawler-based discovery but is not a ranking guarantee.
- **Ignoring CDN and firewall behavior.** Robots.txt may allow a bot while infrastructure blocks its request.
- **Using robots.txt to protect private information.** Blocked paths remain publicly visible in the file.

## Quick answer

To check if OAI-SearchBot is blocked:

1. Open your domain’s `/robots.txt`.
2. Look for an OAI-SearchBot group and any `Disallow` rules.
3. Check the wildcard group if no specific group exists.
4. Test the exact page path you want discovered.
5. Confirm your CDN or firewall is not blocking the crawler.

For a broader technical preflight, run the [free AI visibility checker](https://100questionsai.com/ai-visibility-checker). It shows whether a full-site OAI-SearchBot block is present and identifies related technical issues that can limit AI-search discovery.

---

## Sources

- [OpenAI: Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)
- [OpenAI: Guidance for Allowing Web Crawlers](https://help.openai.com/en/articles/20001243-advertiser-guidance-for-allowing-openai-web-crawlers)
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/info/rfc9309/)


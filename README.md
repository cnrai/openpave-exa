# openpave-exa

AI-powered web search skill for PAVE using [Exa.ai](https://exa.ai) neural search.

## Features

- **Neural Search** - Semantic understanding of queries, not just keyword matching
- **People Search** - Find professionals on LinkedIn
- **Company Search** - Discover companies and startups
- **News Search** - Find recent news articles
- **Research Papers** - Search academic papers
- **GitHub Repos** - Find relevant repositories
- **Tweet Search** - Search Twitter/X posts
- **Similar Links** - Find pages similar to a URL
- **AI Answers** - Get AI-generated answers with sources

## Installation

```bash
# Install from GitHub
pave install cnrai/openpave-exa

# Or install from local path
pave install /path/to/openpave-exa
```

## Configuration

Add your Exa API key to your environment:

```bash
# In your .env file
EXA_API_KEY=your_api_key_here
```

Get your API key at [exa.ai](https://exa.ai).

## Usage

```bash
# General web search
pave run exa search "latest AI developments"

# Search for people on LinkedIn
pave run exa people "AI engineers in San Francisco" --num 15

# Search for companies
pave run exa company "AI startups in Southeast Asia"

# Search news with date filter
pave run exa news "OpenAI announcements" --from 2026-01-01

# Search research papers
pave run exa research "transformer architecture"

# Search GitHub repositories
pave run exa github "LLM agent framework"

# Search tweets
pave run exa tweets "vibe coding"

# Find similar pages
pave run exa similar "https://example.com/article"

# Get AI-generated answer with sources
pave run exa answer "What is vibe coding?"
```

## Options

| Option | Description |
|--------|-------------|
| `-n, --num <number>` | Number of results (default: 10, max: 100) |
| `-t, --type <type>` | Search type: auto, neural, fast, deep |
| `-d, --domains <domains>` | Include only these domains (comma-separated) |
| `-x, --exclude <domains>` | Exclude these domains (comma-separated) |
| `--from <date>` | Published after date (YYYY-MM-DD) |
| `--to <date>` | Published before date (YYYY-MM-DD) |
| `--json` | Output raw JSON |
| `--summary` | Output human-readable summary (default) |

## Commands

| Command | Description |
|---------|-------------|
| `search <query>` | General web search |
| `people <query>` | Search LinkedIn profiles |
| `company <query>` | Search companies |
| `news <query>` | Search news articles |
| `research <query>` | Search research papers |
| `github <query>` | Search GitHub repositories |
| `tweets <query>` | Search tweets |
| `similar <url>` | Find similar links |
| `answer <question>` | AI answer with sources |

## Examples

### Find AI Engineers

```bash
pave run exa people "machine learning engineer at FAANG" --num 20
```

### Research a Topic

```bash
pave run exa research "attention is all you need" --num 5 --json
```

### Recent News

```bash
pave run exa news "GPT-5 release" --from 2026-01-01 --to 2026-02-01
```

### Domain-Specific Search

```bash
pave run exa search "typescript best practices" --domains "github.com,stackoverflow.com"
```

## Security

This skill uses PAVE's secure token system. Your API key is never exposed to the sandbox code - it's injected at the host level during authenticated requests.

## Pricing

Exa.ai charges per search:
- ~$0.005 per neural search
- ~$0.015 per deep search

See [exa.ai/pricing](https://exa.ai/pricing) for current rates.

## License

MIT

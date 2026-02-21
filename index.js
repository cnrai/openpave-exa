#!/usr/bin/env node

/**
 * Exa.ai Skill for PAVE
 * 
 * AI-powered search with neural capabilities using secure token system.
 * Supports people search (LinkedIn), company search, news, research, and more.
 * 
 * Usage:
 *   exa search "query" [options]
 *   exa people "vibe coder in hong kong"
 *   exa company "AI startups in Singapore"
 *   exa news "latest AI developments"
 *   exa research "transformer architecture"
 *   exa github "LLM agent framework"
 *   exa tweets "AI coding assistants"
 *   exa similar "https://example.com"
 *   exa answer "What is vibe coding?"
 */

// Constants
const EXA_API_BASE = 'https://api.exa.ai';

/**
 * Exa.ai API Client - Secure Token Version
 */
class ExaClient {
  constructor() {
    this.timeout = 15000;
  }

  /**
   * Make an API request to Exa using secure token system
   */
  request(endpoint, body) {
    try {
      // Use authenticatedFetch for secure token injection
      const response = authenticatedFetch('exa', `${EXA_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        timeout: this.timeout
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = response.json();
          errorText = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch (e) {
          errorText = response.text();
        }
        
        const error = new Error(`Exa API error: ${response.status} - ${errorText}`);
        error.status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error.message && error.message.includes('Network permission denied')) {
        console.error('Network permission needed for: api.exa.ai');
        console.error('Request permission with: --allow-network=api.exa.ai');
      } else if (error.message && error.message.includes('Token not found')) {
        console.error('Exa token not configured');
        console.error('Configure EXA_API_KEY in your environment');
      }
      throw error;
    }
  }

  /**
   * Search the web using Exa's neural search
   */
  search(query, options = {}) {
    const body = {
      query,
      numResults: options.numResults || 10,
      type: options.type || 'auto',
      ...options,
    };

    // Include text content by default
    if (options.text !== false) {
      body.text = true;
    }

    return this.request('/search', body);
  }

  /**
   * Search for people (LinkedIn profiles)
   */
  searchPeople(query, options = {}) {
    return this.search(query, {
      ...options,
      category: 'people',
      includeDomains: ['linkedin.com'],
    });
  }

  /**
   * Search for companies
   */
  searchCompanies(query, options = {}) {
    return this.search(query, {
      ...options,
      category: 'company',
    });
  }

  /**
   * Search for news articles
   */
  searchNews(query, options = {}) {
    return this.search(query, {
      ...options,
      category: 'news',
    });
  }

  /**
   * Search for research papers
   */
  searchResearch(query, options = {}) {
    return this.search(query, {
      ...options,
      category: 'research paper',
    });
  }

  /**
   * Search GitHub repositories
   */
  searchGitHub(query, options = {}) {
    return this.search(query, {
      ...options,
      category: 'github',
    });
  }

  /**
   * Search tweets
   */
  searchTweets(query, options = {}) {
    return this.search(query, {
      ...options,
      category: 'tweet',
    });
  }

  /**
   * Find similar links to a given URL
   */
  findSimilar(url, options = {}) {
    const body = {
      url,
      numResults: options.numResults || 10,
      ...options,
    };

    return this.request('/findSimilar', body);
  }

  /**
   * Ask a question and get an AI-generated answer with sources
   */
  answer(query, options = {}) {
    const body = {
      query,
      ...options,
    };

    return this.request('/answer', body);
  }

  /**
   * Format search results for human-readable output
   */
  formatResults(response) {
    if (!response.results || response.results.length === 0) {
      return 'No results found.';
    }

    const lines = [];
    lines.push(`Found ${response.results.length} results:\n`);

    for (let i = 0; i < response.results.length; i++) {
      const result = response.results[i];
      lines.push(`${i + 1}. ${result.title || 'Untitled'}`);
      lines.push(`   URL: ${result.url}`);
      if (result.author) {
        lines.push(`   Author: ${result.author}`);
      }
      if (result.publishedDate) {
        lines.push(`   Published: ${new Date(result.publishedDate).toLocaleDateString()}`);
      }
      if (result.summary) {
        lines.push(`   Summary: ${result.summary.slice(0, 200)}...`);
      } else if (result.text) {
        lines.push(`   Preview: ${result.text.slice(0, 200)}...`);
      }
      lines.push('');
    }

    if (response.costDollars && response.costDollars.total > 0) {
      lines.push(`Cost: $${response.costDollars.total.toFixed(4)}`);
    }

    return lines.join('\n');
  }

  /**
   * Format people search results for LinkedIn profiles
   */
  formatPeopleResults(response) {
    if (!response.results || response.results.length === 0) {
      return 'No LinkedIn profiles found.';
    }

    const lines = [];
    lines.push(`Found ${response.results.length} LinkedIn profiles:\n`);

    for (let i = 0; i < response.results.length; i++) {
      const result = response.results[i];
      // Parse LinkedIn profile info from title/text
      const name = result.title?.replace(' | LinkedIn', '').replace(' - LinkedIn', '') || 'Unknown';
      lines.push(`${i + 1}. ${name}`);
      lines.push(`   URL: ${result.url}`);
      if (result.text) {
        // Extract first meaningful line from profile text
        const preview = result.text.split('\n').find(line => line.trim().length > 20) || result.text;
        lines.push(`   About: ${preview.slice(0, 150)}...`);
      }
      lines.push('');
    }

    if (response.costDollars && response.costDollars.total > 0) {
      lines.push(`Cost: $${response.costDollars.total.toFixed(4)}`);
    }

    return lines.join('\n');
  }
}

/**
 * Parse command line arguments manually (no commander.js in sandbox)
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    return { command: 'help' };
  }

  const command = args[0];
  const query = args[1];
  const options = {};

  // Parse options
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (value !== undefined) {
        options[key] = value;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.substring(1);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return { command, query, options };
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Exa.ai Skill - AI-powered neural search

Usage:
  exa <command> <query> [options]

Commands:
  search <query>     General web search using neural search
  people <query>     Search for people on LinkedIn
  company <query>    Search for companies
  news <query>       Search for news articles
  research <query>   Search for research papers
  github <query>     Search GitHub repositories
  tweets <query>     Search tweets
  similar <url>      Find similar links to a given URL
  answer <question>  Ask a question and get an AI answer with sources

Options:
  -n, --num <number>         Number of results (default: 10, max: 100)
  -t, --type <type>          Search type: auto, neural, fast, deep (default: auto)
  -d, --domains <domains>    Include only these domains (comma-separated)
  -x, --exclude <domains>    Exclude these domains (comma-separated)
  --from <date>              Published after this date (YYYY-MM-DD)
  --to <date>                Published before this date (YYYY-MM-DD)
  --json                     Output raw JSON
  --summary                  Output human-readable summary (default)

Examples:
  exa search "latest AI developments" --summary
  exa people "vibe coder in hong kong" --num 15
  exa company "AI startups in Singapore"
  exa news "OpenAI announcements" --from 2026-01-01
  exa research "transformer architecture"
  exa github "LLM agent framework"
  exa tweets "vibe coding"
  exa similar "https://example.com/article"
  exa answer "What is vibe coding?"

Token Configuration:
  Requires EXA_API_KEY environment variable.
  Token is automatically injected via PAVE secure token system.
`);
}

/**
 * Main CLI execution
 */
function main() {
  try {
    const { command, query, options } = parseArgs();

    if (command === 'help' || command === '--help' || command === '-h') {
      showHelp();
      return;
    }

    if (!query && command !== 'help') {
      console.error('Error: Query is required');
      console.error('Use --help for usage information');
      process.exit(1);
    }

    // Create client (no init() needed with secure tokens)
    const client = new ExaClient();

    // Parse common options
    const searchOptions = {
      numResults: parseInt(options.num || options.n || '10'),
    };

    if (options.type || options.t) {
      searchOptions.type = options.type || options.t;
    }

    if (options.domains || options.d) {
      searchOptions.includeDomains = (options.domains || options.d).split(',').map(d => d.trim());
    }

    if (options.exclude || options.x) {
      searchOptions.excludeDomains = (options.exclude || options.x).split(',').map(d => d.trim());
    }

    if (options.from) {
      searchOptions.startPublishedDate = new Date(options.from).toISOString();
    }

    if (options.to) {
      searchOptions.endPublishedDate = new Date(options.to).toISOString();
    }

    let response;

    // Execute command
    switch (command) {
      case 'search':
        response = client.search(query, searchOptions);
        break;
      case 'people':
        response = client.searchPeople(query, searchOptions);
        break;
      case 'company':
        response = client.searchCompanies(query, searchOptions);
        break;
      case 'news':
        response = client.searchNews(query, searchOptions);
        break;
      case 'research':
        response = client.searchResearch(query, searchOptions);
        break;
      case 'github':
        response = client.searchGitHub(query, searchOptions);
        break;
      case 'tweets':
        response = client.searchTweets(query, searchOptions);
        break;
      case 'similar':
        response = client.findSimilar(query, searchOptions);
        break;
      case 'answer':
        response = client.answer(query, searchOptions);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Use --help for available commands');
        process.exit(1);
    }

    // Format output
    if (options.json) {
      console.log(JSON.stringify(response, null, 2));
    } else if (command === 'answer') {
      // Special formatting for answer command
      if (response.answer) {
        console.log('Answer:');
        console.log(response.answer);
        console.log('\nSources:');
        for (const source of response.results || []) {
          console.log(`  - ${source.title}: ${source.url}`);
        }
      } else {
        console.log(JSON.stringify(response, null, 2));
      }
    } else if (command === 'people') {
      console.log(client.formatPeopleResults(response));
    } else {
      console.log(client.formatResults(response));
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.status === 401) {
      console.error('Check your Exa API key configuration');
    } else if (error.status === 402) {
      console.error('API quota exceeded or payment required');
    } else if (error.status === 429) {
      console.error('Rate limit exceeded, try again later');
    }
    process.exit(1);
  }
}

// Run main
main();

module.exports = { ExaClient };

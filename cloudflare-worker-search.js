// Cloudflare Worker for L'Oréal-focused web search
// Replace 'YOUR_SEARCH_API_KEY' and 'YOUR_SEARCH_API_ENDPOINT' with your actual API credentials
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query parameter q' }), { status: 400 });
    }

    // Prefix query to focus on L'Oréal
    const lorealQuery = `L'Oréal ${query}`;

    // Example: Bing Web Search API
    const apiKey = 'YOUR_SEARCH_API_KEY';
    const endpoint = 'YOUR_SEARCH_API_ENDPOINT';
    const searchUrl = `${endpoint}?q=${encodeURIComponent(lorealQuery)}&count=5`;

    const apiResponse = await fetch(searchUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });
    const data = await apiResponse.json();

    // Extract relevant results
    const results = (data.webPages?.value || []).map(item => ({
      title: item.name,
      url: item.url,
      snippet: item.snippet,
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

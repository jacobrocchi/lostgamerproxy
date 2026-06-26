export default async function handler(req, res) {
  const targetUrl = `https://lostgamer.io${req.url.replace('/api', '')}`;
  
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://google.com/',
        'Host': 'lostgamer.io'
      }
    });
    
    const body = await response.text();
    const host = req.headers.host;
    
    // Rewrite URLs
    const modified = body
      .replace(/https:\/\/lostgamer\.io/g, `https://${host}`)
      .replace(/lostgamer\.io/g, host);
    
    res.status(response.status);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(modified);
    
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
}
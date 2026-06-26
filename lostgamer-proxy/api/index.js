export default async function handler(req, res) {
  try {
    // Build target URL - preserve full path including query strings
    const targetUrl = `https://lostgamer.io${req.url}`;
    
    console.log('Proxying to:', targetUrl);
    
    const fetchOptions = {
      method: req.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.google.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Upgrade-Insecure-Requests': '1',
        'Host': 'lostgamer.io',
        'Connection': 'keep-alive'
      },
      redirect: 'follow'
    };

    if (!['GET', 'HEAD'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
      fetchOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(targetUrl, fetchOptions);
    
    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');
    
    // Get response body
    const body = await response.text();
    
    // Rewrite URLs in HTML content
    let modifiedBody = body;
    if (isHtml) {
      const host = req.headers.host || req.headers['x-forwarded-host'];
      modifiedBody = body
        .replace(/https:\/\/lostgamer\.io/g, `https://${host}`)
        .replace(/\/\/lostgamer\.io/g, `//${host}`)
        .replace(/lostgamer\.io/g, host);
    }
    
    // Set status and headers
    res.status(response.status);
    
    // Copy headers from target response
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(lowerKey)) {
        res.setHeader(key, value);
      }
    });
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // Remove problematic headers
    res.removeHeader('content-security-policy');
    res.removeHeader('x-frame-options');
    
    res.send(modifiedBody);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      stack: error.stack 
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
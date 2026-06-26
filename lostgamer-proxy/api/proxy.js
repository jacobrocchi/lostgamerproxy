import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  // Remove /api from the path
  const targetPath = req.url.replace(/^\/api/, '');
  
  const proxy = createProxyMiddleware({
    target: 'https://lostgamer.io',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // Remove /api prefix when forwarding
    },
    onProxyReq: (proxyReq, req) => {
      // Set headers to appear as a real browser
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
      proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
      proxyReq.setHeader('Referer', 'https://www.google.com/');
      proxyReq.removeHeader('x-vercel-ip-country');
      proxyReq.removeHeader('x-vercel-ip-city');
      proxyReq.removeHeader('x-vercel-ip-latitude');
      proxyReq.removeHeader('x-vercel-ip-longitude');
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      
      // Remove security headers that might cause issues
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-frame-options'];
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
    logLevel: 'debug',
  });

  return proxy(req, res);
}

// Handle all HTTP methods
export const config = {
  api: {
    bodyParser: false, // Let the proxy handle the body
  },
};
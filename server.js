const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad Request');
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT, safePath);

  function tryServeFile(candidatePath) {
    return new Promise((resolve) => {
      fs.stat(candidatePath, (err, stats) => {
        if (!err && stats.isFile()) {
          const ext = path.extname(candidatePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          fs.createReadStream(candidatePath).pipe(res);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  async function handle() {
    // Intercept Shopify legacy cart endpoints
    if (pathname.startsWith('/cart/') && pathname.endsWith('.js')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'success', item_count: 0, items: [] }));
    }

    // Special handler for /collections or /collections/
    if (pathname === '/collections' || pathname === '/collections/') {
      if (await tryServeFile(path.join(ROOT, 'collections', 'all.html'))) return;
      if (await tryServeFile(path.join(ROOT, 'html', 'collections', 'all.html'))) return;
    }

    // 1. Try exact file path
    if (await tryServeFile(filePath)) return;

    // 2. If it's root or directory, try index.html
    if (await tryServeFile(path.join(filePath, 'index.html'))) return;

    // 3. Try with .html extension (e.g. /collections/cat-treats -> /collections/cat-treats.html)
    if (await tryServeFile(filePath + '.html')) return;

    // 4. If request is /collections/:cat/products/:slug, fallback to /products/:slug.html
    const colProdMatch = pathname.match(/^\/collections\/[^\/]+\/products\/(.+)$/);
    if (colProdMatch) {
      const slug = colProdMatch[1].replace(/\.html$/, '');
      if (await tryServeFile(path.join(ROOT, 'products', slug + '.html'))) return;
      if (await tryServeFile(path.join(ROOT, 'html', 'products', slug + '.html'))) return;
    }

    // 5. If request is /products/:slug, fallback to /html/products/:slug.html
    const prodMatch = pathname.match(/^\/products\/(.+)$/);
    if (prodMatch) {
      const slug = prodMatch[1].replace(/\.html$/, '');
      if (await tryServeFile(path.join(ROOT, 'products', slug + '.html'))) return;
      if (await tryServeFile(path.join(ROOT, 'html', 'products', slug + '.html'))) return;
    }

    // 6. Try fallback in html/ subdirectory
    let htmlSubdirPath = path.join(ROOT, 'html', safePath);
    if (await tryServeFile(htmlSubdirPath)) return;
    if (await tryServeFile(path.join(htmlSubdirPath, 'index.html'))) return;
    if (await tryServeFile(htmlSubdirPath + '.html')) return;

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1><p>The requested URL ' + pathname + ' was not found on this server.</p>');
  }

  handle().catch((err) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error: ' + err.message);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

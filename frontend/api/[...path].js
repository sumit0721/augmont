const http = require('http');

const EC2_HOST = '15.207.84.178';
const EC2_PORT = 3000;

const handler = (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  const pathSegments = req.query.path;
  const apiPath = Array.isArray(pathSegments) ? pathSegments.join('/') : (pathSegments || '');
  const qs = req.url.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '';
  const targetPath = `/api/${apiPath}${qs}`;

  const headers = { ...req.headers, host: `${EC2_HOST}:${EC2_PORT}` };
  delete headers['x-vercel-id'];
  delete headers['x-forwarded-for'];
  delete headers['x-forwarded-host'];
  delete headers['x-forwarded-proto'];
  delete headers['x-real-ip'];
  delete headers['connection'];

  const proxyReq = http.request(
    { hostname: EC2_HOST, port: EC2_PORT, path: targetPath, method: req.method, headers },
    (proxyRes) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      Object.entries(proxyRes.headers).forEach(([k, v]) => {
        if (k !== 'transfer-encoding') res.setHeader(k, v);
      });
      res.status(proxyRes.statusCode);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    res.status(502).json({ error: 'Backend unreachable', message: err.message });
  });

  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
};

module.exports = handler;

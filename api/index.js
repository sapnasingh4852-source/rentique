const app = require('../backend/server');

module.exports = (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.searchParams.get('__path') || '';
  url.searchParams.delete('__path');

  const query = url.searchParams.toString();
  req.url = `/api/${path.replace(/^\/+/, '')}${query ? `?${query}` : ''}`;

  return app(req, res);
};

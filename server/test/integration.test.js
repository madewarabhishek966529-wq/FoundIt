import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'http';
import app from '../src/app.js';

const makeRequest = (server, options, body = null) => {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request(
      {
        hostname: 'localhost',
        port: address.port,
        path: options.path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

test('Integration: /api/v1/health returns 200 with service status', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const res = await makeRequest(server, { path: '/api/v1/health' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'healthy');
  } finally {
    server.close();
  }
});

test('Integration: Unmatched route returns 404 with standardized error JSON shape', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const res = await makeRequest(server, { path: '/api/v1/non-existent-endpoint' });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  } finally {
    server.close();
  }
});

test('Integration: Protected endpoint returns 401 when no token is supplied', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const res = await makeRequest(server, { path: '/api/v1/items/mine' });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  } finally {
    server.close();
  }
});

test('Integration: Register with invalid body returns 422 validation error', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const res = await makeRequest(
      server,
      { path: '/api/v1/auth/register', method: 'POST' },
      { email: 'bad-email' } // missing name and password
    );
    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(res.body.error.details));
  } finally {
    server.close();
  }
});

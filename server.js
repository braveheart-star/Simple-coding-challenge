const http = require('http');
const url = require('url');

// In-memory data store
let items = [
    { id: 1, name: "Sample Item 1" },
    { id: 2, name: "Sample Item 2" }
];

let nextId = 3;

// Helper function to parse request body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

// Helper function to send JSON response with CORS headers
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // GET /items - return all items
    if (path === '/items' && method === 'GET') {
        sendJSON(res, 200, items);
        return;
    }

    // POST /items - create new item
    if (path === '/items' && method === 'POST') {
        try {
            const body = await parseBody(req);
            
            // Validate that name is provided
            if (!body.name || typeof body.name !== 'string') {
                sendJSON(res, 400, { error: 'Name is required and must be a string' });
                return;
            }

            // Create new item
            const newItem = {
                id: nextId++,
                name: body.name
            };

            items.push(newItem);
            sendJSON(res, 201, newItem);
        } catch (error) {
            sendJSON(res, 400, { error: 'Invalid JSON in request body' });
        }
        return;
    }

    // 404 for other routes
    sendJSON(res, 404, { error: 'Not Found' });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


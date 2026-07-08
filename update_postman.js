const fs = require('fs');

const colPath = 'augmont_postman_collection.json';
const col = JSON.parse(fs.readFileSync(colPath, 'utf8'));

// Find or create folders
function getFolder(name) {
  let folder = col.item.find(i => i.name.includes(name));
  if (!folder) {
    folder = { name: name, item: [] };
    col.item.push(folder);
  }
  return folder;
}

const authFolder = getFolder('Authentication');
const catFolder = getFolder('Categories');
const prodFolder = getFolder('Products');
const usersFolder = getFolder('Users');
const bulkFolder = getFolder('Bulk Upload');
const repFolder = getFolder('Reports');

const authHeader = [
  {
    "key": "Authorization",
    "value": "Bearer {{token}}",
    "type": "text"
  }
];

// Helper to add request
function addRequest(folder, name, method, urlPath, queryParams = [], body = null) {
  // Fix path params formatting for Postman (Postman URL path array doesn't like variables starting with colon sometimes, but it handles it)
  const pathParts = urlPath.split('/');
  
  const req = {
    name,
    request: {
      method,
      header: authHeader,
      url: {
        raw: `{{baseUrl}}/${urlPath}` + (queryParams.length ? '?' + queryParams.map(q => `${q.key}=${q.value}`).join('&') : ''),
        host: ['{{baseUrl}}'],
        path: pathParts,
        query: queryParams,
        variable: pathParts.filter(p => p.startsWith(':')).map(p => ({
            key: p.substring(1),
            value: '1'
        }))
      }
    }
  };
  
  if (body) {
    req.request.body = body;
  }
  
  // check if already exists
  if (!folder.item.find(i => i.name === name)) {
    folder.item.push(req);
  }
}

// Categories
addRequest(catFolder, 'Update Category', 'PUT', 'categories/:id', [], {
  mode: 'raw',
  raw: '{\n    "name": "Updated Name"\n}',
  options: { raw: { language: 'json' } }
});
addRequest(catFolder, 'Delete Category', 'DELETE', 'categories/:id');

// Products
addRequest(prodFolder, 'Get Product by ID', 'GET', 'products/:id');
addRequest(prodFolder, 'Update Product', 'PUT', 'products/:id', [], {
  mode: 'formdata',
  formdata: [
    { key: 'name', value: 'Updated Product Name', type: 'text' },
    { key: 'price', value: '299.99', type: 'text' },
    { key: 'categoryId', value: '1', type: 'text' }
  ]
});
addRequest(prodFolder, 'Delete Product', 'DELETE', 'products/:id');
addRequest(prodFolder, 'Search by Category Name', 'GET', 'products', [
  { key: 'search', value: 'Electronics' }
]);
addRequest(prodFolder, 'Sort by Price - Ascending', 'GET', 'products', [
  { key: 'sort', value: 'price' },
  { key: 'order', value: 'asc' }
]);
addRequest(prodFolder, 'Sort by Price - Descending', 'GET', 'products', [
  { key: 'sort', value: 'price' },
  { key: 'order', value: 'desc' }
]);
addRequest(prodFolder, 'Pagination - Page 1', 'GET', 'products', [
  { key: 'page', value: '1' },
  { key: 'limit', value: '10' }
]);
addRequest(prodFolder, 'Pagination - Page 2', 'GET', 'products', [
  { key: 'page', value: '2' },
  { key: 'limit', value: '10' }
]);

// Users
addRequest(usersFolder, 'Get All Users', 'GET', 'users');
addRequest(usersFolder, 'Get User by ID', 'GET', 'users/:id');
addRequest(usersFolder, 'Update User', 'PUT', 'users/:id', [], {
  mode: 'raw',
  raw: '{\n    "name": "Updated Name"\n}',
  options: { raw: { language: 'json' } }
});
addRequest(usersFolder, 'Delete User', 'DELETE', 'users/:id');

// Reports
// Move existing CSV to Reports folder if it exists in Products
const csvIndex = prodFolder.item.findIndex(i => i.name === 'Download CSV Report');
if (csvIndex !== -1) {
  const csvReq = prodFolder.item.splice(csvIndex, 1)[0];
  repFolder.item.push(csvReq);
}
addRequest(repFolder, 'Download Report - XLSX', 'GET', 'products/report', [
  { key: 'format', value: 'xlsx' }
]);

// Bulk Upload
addRequest(bulkFolder, 'Upload Products Bulk', 'POST', 'products/bulk-upload', [], {
  mode: 'formdata',
  formdata: [
    { key: 'file', type: 'file', src: '' }
  ]
});
addRequest(bulkFolder, 'Check Bulk Upload Status', 'GET', 'products/bulk-upload/status/:jobId');

fs.writeFileSync(colPath, JSON.stringify(col, null, 2));
console.log('Collection updated successfully');

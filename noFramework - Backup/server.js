const http = require('http');
const mysql = require('mysql');
const url = require('url');

// Configure Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'assignment4'
});

// Connect to Database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const path = reqUrl.pathname;
  const segments = path.split('/').filter(Boolean); // Split path and remove empty segments
  let SQL = ''; // Initialize  SQL as null

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request = OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  // [Path 1] GET - Read all Users - '/users/get'
  if (segments[1] === 'get' && segments.length === 2 
  && req.method === 'GET') {
    SQL = 'SELECT * FROM users';
    db.query(SQL, (err, results) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    });
  }

  // [Path 2] POST - Create a User - '/users/create'
  else if (segments[1] === 'create' && segments.length === 2 
  && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
      const user = JSON.parse(body);
      const { title, titleOther, firstName, surName, mobile, email } = user;

      const validTitles = ['Mx', 'Ms', 'Mr', 'Mrs', 'Miss', 'Dr', 'Other'];
      if (!validTitles.includes(title)) {
        res.writeHead(400);
        res.end('Invalid title. Must be one of Mx, Ms, Mr, Mrs, Miss, Dr, Other.');
        return;
      }

      if (title === 'Other' && !titleOther) {
        res.writeHead(400);
        res.end('titleOther is required when title is Other.');
        return;
      }

      if (!firstName || !surName || !mobile || !email) {
        res.writeHead(400);
        res.end('Missing required fields');
        return;
      }

      SQL = 'INSERT INTO users SET ?';
      db.query(SQL, user, (err, result) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        res.writeHead(201);
        res.end(`User added with ID: ${result.insertId}`);
      });
    }); 

  // [Path 3] GET - Read a User - '/users/get/:userId'
  } else if (segments[1] === 'get' && segments.length === 3 
  && req.method === 'GET') {
    const userId = segments[2];
    SQL = 'SELECT * FROM users WHERE userId = ?';
    db.query(SQL, [userId], (err, result) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  }

  // [Path 4] PUT - Update a User - '/users/update/:userId'
  else if (segments[1] === 'update' && segments.length === 3
  && req.method === 'PUT') {
    let body = '';
    const userId = segments[2];
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const user = JSON.parse(body);
      const { title, titleOther, firstName, surName, mobile, email } = user;

      // Add your validation and update logic here
      SQL = 'UPDATE users SET title = ?, titleOther = ?, firstName = ?, surName = ?, mobile = ?, email = ? WHERE userId = ?';
      db.query(SQL, [title, titleOther, firstName, surName, mobile, email, userId], (err, result) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        res.writeHead(200);
        res.end(`User with ID: ${userId} updated.`);
      });
    });
  }

  // [Path 5] DELETE - Delete a User - '/users/delete/:userId'
  else if (segments[1] === 'delete' && segments.length === 3 
  && req.method === 'DELETE') {
    const userId = segments[2];
    SQL = 'DELETE FROM users WHERE userId = ?';
    db.query(SQL, [userId], (err, result) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200);
      res.end(`User with ID: ${userId} deleted.`);
    });
  }

  // [Path 6] GET - Read all addresses for a specific user - '/users/:userId/addresses'
  else if (segments[0] === 'users' && segments[2] === 'addresses' 
  && segments.length === 3 && req.method === 'GET') {
    const userId = segments[1]; // Extract userId from the path
    const SQL = 'SELECT * FROM addresses WHERE userId = ?';
    db.query(SQL, [userId], (err, results) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    });
  }

  // [Path 7] POST - Create an address for a specific user - '/users/:userId/addresses/create'
  else if (segments[0] === 'users' && segments[2] === 'addresses' && segments[3] === 'create' 
  && segments.length === 4 && req.method === 'POST') {
    let body = '';
    const userId = segments[1]; // Extract userId from the path

    req.on('data', chunk => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on('end', () => {
      const { addressType, addressLine1, addressLine2, town, countyCity, eircode } = JSON.parse(body);

      if (!addressType || !addressLine1 || !town || !countyCity) {
        res.writeHead(400);
        res.end('Missing required fields');
        return;
      }

      const address = { userId, addressType, addressLine1, addressLine2, town, countyCity, eircode };
      const SQL = 'INSERT INTO addresses SET ?';
      
      db.query(SQL, address, (err, result) => {
        if (err) {
          console.error(err);
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(201);
        res.end(`Address added with ID: ${result.insertId}`);
      });
    });
  }

  // [Path 8] GET - Read a specific address for a specific user - '/users/:userId/addresses/:addressId'
  else if (segments[0] === 'users' && segments[2] === 'addresses' 
  && segments.length === 4 && req.method === 'GET') {
    const userId = segments[1]; // Extract userId from the path
    const addressId = segments[3]; // Extract addressId from the path
    const SQL = 'SELECT * FROM addresses WHERE userId = ? AND addressId = ?';

    db.query(SQL, [userId, addressId], (err, result) => {
      if (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  }

  // [Path 9] PUT - Update a specific address for a specific user - '/users/:userId/addresses/:addressId/update'
  else if (segments[0] === 'users' && segments[2] === 'addresses' && segments[4] === 'update' 
  && segments.length === 5 && req.method === 'PUT') {
    let body = '';
    const userId = segments[1]; // Extract userId from the path
    const addressId = segments[3]; // Extract addressId from the path

    req.on('data', chunk => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on('end', () => {
      const { addressType, addressLine1, addressLine2, town, countyCity, eircode } = JSON.parse(body);
      
      const SQL = `UPDATE addresses SET addressType = ?, addressLine1 = ?, addressLine2 = ?, town = ?, countyCity = ?, eircode = ? WHERE userId = ? AND addressId = ?`;

      db.query(SQL, [addressType, addressLine1, addressLine2, town, countyCity, eircode, userId, addressId], (err, result) => {
        if (err) {
          console.error(err);
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200);
        res.end(`Address with ID: ${addressId} updated.`);
      });
    });
  }

  // [Path 10] DELETE - Delete a specific address for a specific user - '/users/:userId/addresses/delete/:addressId'
  else  if (segments[0] === 'users' && segments[2] === 'addresses' && segments[3] === 'delete' 
  && segments.length === 5 && req.method === 'DELETE') {
    const userId = segments[1]; // Extract userId from the path
    const addressId = segments[4]; // Extract addressId from the path
    const SQL = 'DELETE FROM addresses WHERE userId = ? AND addressId = ?';

    db.query(SQL, [userId, addressId], (err, result) => {
      if (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200);
      res.end(`Address with ID: ${addressId} deleted.`);
    });
  }

  // [Path 11] Path Not Found
  else {
    res.writeHead(404);
    res.end('Not Found');
  }
}); // end of http.createServer

// Server listen to the PORT => http://localhost:5000/
const port = 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
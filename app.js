const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'passwordd', // Replace with your MySQL password
    database: 'business_supply', // Replace with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        process.exit(1);
    }
    console.log('Connected to MySQL');
});

// Endpoint to execute stored procedures
app.post('/run_procedure', (req, res) => {
    const { procedureName, params } = req.body;

    // Construct the CALL query dynamically
    const placeholders = params.map(() => '?').join(', ');
    const query = `CALL ${procedureName}(${placeholders})`;

    console.log(`Executing procedure: ${query} with params: ${params}`);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error executing procedure:', err);
            return res.status(500).json({ error: 'Failed to execute procedure' });
        }
        res.json(results);
    });
});

// Endpoint to fetch data from views
const allowedViews = [
    'display_owner_view',
    'display_employee_view',
    'display_driver_view',
    'display_location_view',
    'display_product_view',
    'display_service_view',
];

app.get('/views/:viewName', (req, res) => {
    const { viewName } = req.params;

    if (!allowedViews.includes(viewName)) {
        console.log(`Invalid view name: ${viewName}`);
        return res.status(400).json({ error: 'Invalid view name' });
    }

    const query = `SELECT * FROM ${viewName}`;
    console.log(`Fetching data from view: ${viewName}`);

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching view data:', err);
            return res.status(500).json({ error: 'Failed to fetch view data' });
        }
        res.json(results);
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



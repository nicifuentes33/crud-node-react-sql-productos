const mysql = require('mysql2');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Admin',
    database: 'tienda'
});


connection.connect((err) => {
    if (err) {
        console.log('Error connecting to database', err);
        return;
    }

    console.log('Connected to mysql database');
});

module.exports = connection;
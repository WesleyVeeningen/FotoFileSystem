var express = require('express');
var router = express.Router();
const pool = require('../database.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/auth/login');
});


router.get('/login', function (req, res, next) {
    let errors = ""; // Initialize errors variable here

    res.render('auth/login', { title: 'Express', errors: errors });
});

router.post('/login', async function (req, res, next) {
    let errors = { email: "", password: "" }; // Initialize errors object with empty strings

    if (req.body.email == "") {
        errors.email = "Email is required.";
    }
    if (req.body.password == "") {
        errors.password = "Password is required.";
    }

    if (errors.email || errors.password) {
        // Re-render the login form with errors
        res.render('auth/login', { errors: errors });
    } else {
        console.log(req.body)
        // Check if the user exists in the database
        const { email, password } = req.body;

        let user = await pool.query('SELECT * FROM users WHERE user_email = ? AND user_password = ?', [email, password]);
        console.log(user[0])
        if (user[0].length > 0) {
            // User successfully logged in
            console.log('User successfully logged in:', user[0]);
            // Redirect to the home page or any other appropriate page after successful login
            res.redirect('/');
        } else {
            // User not found
            errors.email = "Email or password is incorrect.";
            res.render('auth/login', { errors: errors });
        }
        console.log('hi 3')
    }
});


router.get('/register', function (req, res, next) {

    let errors = ""; // Initialize errors variable here

    res.render('auth/register', { errors: errors });
});


router.post('/register', function (req, res, next) {
    let errors = { username: "", email: "", password: "", confirm: "" }; // Initialize errors object with empty strings

    console.log(req.body);

    if (req.body.username == "") {
        errors.username = "Username is required.";
    }

    if (req.body.email == "") {
        errors.email = "Email is required.";
    }
    if (req.body.password == "") {
        errors.password = "Password is required.";
    }
    if (req.body.password != req.body.confirm) {
        errors.confirm = "Passwords do not match.";
    }

    if (errors.username || errors.email || errors.password || errors.confirm) {
        // Re-render the registration form with errors
        res.render('auth/register', { errors: errors });
    } else {
        // Insert the user into the database
        const { username, email, password } = req.body;
        pool.query('INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)', [username, email, password], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                res.status(500).send('Error registering user');
            } else {
                // User successfully registered
                res.redirect('/auth/login');
            }
        });
    }
});



module.exports = router;

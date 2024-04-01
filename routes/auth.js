var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/auth/login');
});


router.get('/login', function (req, res, next) {
    let errors = ""; // Initialize errors variable here

    res.render('auth/login', { title: 'Express', errors: errors });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If user not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        // If passwords don't match, return an error
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.isLoggedIn = true;
        req.session.username = user.username;
        req.session.email = user.email;

        console

        // If passwords match, redirect to the home page
        res.redirect(`/`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/register', function (req, res, next) {

    let errors = ""; // Initialize errors variable here

    res.render('auth/register', { errors: errors });
});


router.post('/register', async (req, res) => {
    const { username, email, password, confirm } = req.body;

    try {
        // Check if password and confirm match
        if (password !== confirm) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with hashed password
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        req.session.isLoggedIn = true;
        req.session.username = username;
        req.session.email = email;


        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});







module.exports = router;

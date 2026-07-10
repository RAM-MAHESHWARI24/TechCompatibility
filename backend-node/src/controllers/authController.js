const AuthModel = require('../models/authModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: "${username}".`);

    if (!username || !password) {
      console.warn('Login attempt failed: Missing username or password.');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await AuthModel.findByUsername(username);
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !isMatch) {
      console.warn(`Login failed: Invalid credentials for username: "${username}".`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    console.log(`Login successful for user ID ${user.id} ("${user.username}"). Token issued.`);

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Error during login process:', err);
    next(err);
  }
};

const AuthModel = require('../models/authModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await AuthModel.findByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    next(err);
  }
};

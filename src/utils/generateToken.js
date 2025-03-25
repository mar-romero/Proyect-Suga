const jwt = require('jsonwebtoken');
require('dotenv').config();

const payload = {
  id: '12345',
  role: 'admin'
};

const token = jwt.sign(
  payload,
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

console.log(token); 
// This is a modular function for validating jwt tokens
const jwt = require('jsonwebtoken');
const config = require('config');

// middleware takes in a requst and a response and then calls a continuation
module.exports = function (req, res, next) {
  // get token
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization rejected' });
  }
  // verify
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    // middlewear always calls the continuation, the next
    next();
  } catch (error) {
    res.status(401).json({ msg: 'token is not validated' });
  }
};

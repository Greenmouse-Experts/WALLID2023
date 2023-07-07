const passport = require('passport');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const { userService } = require('../services/index');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

async function validateToken(req, res, next) {
  // get token from request header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: 'Invalid token' });
  }
  const token = authHeader.split(' ')[1];
  // the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
  if (!token) res.sendStatus(400).send({ message: 'Token not specifield' });
  jwt.verify(token, config.jwt.secret, async (err, user) => {
    if (err) {
      res.status(401).send({ message: 'Invalid token' });
    } else {
      if (!(await userService.getUserById(user.id))) {
        res.status(401).send({ message: 'Invalid token' });
      }
      req.user = user;
      next(); // proceed to the next action in the calling function
    }
  }); // end of jwt.verify()
}

module.exports = {
  auth,
  validateToken,
};

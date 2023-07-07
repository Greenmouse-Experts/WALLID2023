const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { generateWallID, generateWallIdQrcode } = require('../utils/wall');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const wallId = generateWallID();
  let payload = req.body;
  payload = {
    ...payload,
    is_business: false,
    wall_id: wallId,
  };
  const user = await userService.createUser(payload);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const corporateRegister = catchAsync(async (req, res) => {
  const wallId = generateWallID();
  let payload = req.body;
  payload = {
    ...payload,
    is_business: true,
    username: payload.email,
    name: payload.company,
    wall_id: wallId,
  };
  const user = await userService.createUser(payload);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const user = catchAsync(async (req, res) => {
  const userInfo = await userService.getUserById(req.user.id);
  const qrcode = await generateWallIdQrcode(userInfo.wall_id);
  res.send({ userInfo, qrcode });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  // const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  const resetPasswordToken = await authService.generateUserPasswordResetToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.email, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  corporateRegister,
  login,
  user,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};

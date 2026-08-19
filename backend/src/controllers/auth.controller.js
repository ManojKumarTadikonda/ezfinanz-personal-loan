const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  success(
    res,
    {
      user: result.user,
      token: result.token,
      demoEmailVerificationToken: result.demoEmailVerificationToken
    },
    "Registration successful",
    201
  );
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  success(res, result, "Login successful");
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.user, req.body.token);
  success(res, { user }, "Email verified");
});

exports.sendPhoneOtp = asyncHandler(async (req, res) => {
  const demoOtp = await authService.sendPhoneOtp(req.user);
  success(res, { demoOtp }, "OTP sent");
});

exports.verifyPhone = asyncHandler(async (req, res) => {
  const user = await authService.verifyPhone(req.user, req.body.otp);
  success(res, { user }, "Phone verified");
});

exports.oauth = asyncHandler(async (req, res) => {
  const result = await authService.oauthLogin(req.body);
  success(res, result, "OAuth login successful");
});

exports.me = asyncHandler(async (req, res) => {
  success(res, { user: req.user }, "Current user");
});

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { generateOtp, hashOtp } = require("../utils/otp");
const { signToken } = require("../utils/token");

async function register({ name, email, phone, password }) {
  if (!email && !phone) {
    throw new Error("Email or phone is required");
  }

  if (email && await User.findOne({ email: email.toLowerCase() })) {
    throw new Error("Email already registered");
  }

  if (phone && await User.findOne({ phone })) {
    throw new Error("Phone already registered");
  }

  const passwordHash = password
    ? await bcrypt.hash(password, 12)
    : undefined;

  const user = await User.create({
    name,
    email: email ? email.toLowerCase() : undefined,
    phone,
    passwordHash,
    authProvider: password ? "LOCAL" : "PHONE"
  });

  let emailToken;

  if (email) {
    emailToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
  }

  const token = signToken(user);

  return {
    user,
    token,
    demoEmailVerificationToken: process.env.DEMO_MODE === "true"
      ? emailToken
      : undefined
  };
}

async function login({ email, phone, password }) {
  const user = await User.findOne({
    $or: [
      email ? { email: email.toLowerCase() } : null,
      phone ? { phone } : null
    ].filter(Boolean)
  });

  if (!user) throw new Error("Invalid credentials");

  if (password) {
    if (!user.passwordHash) throw new Error("Password login is not enabled for this account");

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) throw new Error("Invalid credentials");
  }

  return {
    user,
    token: signToken(user)
  };
}

async function verifyEmail(user, token) {
  if (
    !user.emailVerificationToken ||
    user.emailVerificationToken !== token ||
    !user.emailVerificationExpires ||
    user.emailVerificationExpires < new Date()
  ) {
    throw new Error("Invalid or expired email verification token");
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
}

async function sendPhoneOtp(user) {
  if (!user.phone) throw new Error("Phone number is not available");

  const otp = generateOtp();

  user.phoneOtpHash = hashOtp(otp);
  user.phoneOtpExpires = new Date(
    Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 10) * 60 * 1000
  );

  await user.save();

  console.log(`[DEMO OTP] Phone ${user.phone}: ${otp}`);

  return process.env.DEMO_MODE === "true" ? otp : undefined;
}

async function verifyPhone(user, otp) {
  if (
    !user.phoneOtpHash ||
    hashOtp(otp) !== user.phoneOtpHash ||
    !user.phoneOtpExpires ||
    user.phoneOtpExpires < new Date()
  ) {
    throw new Error("Invalid or expired OTP");
  }

  user.phoneVerified = true;
  user.phoneOtpHash = undefined;
  user.phoneOtpExpires = undefined;
  await user.save();

  return user;
}

async function oauthLogin({ provider, providerId, email, name }) {
  if (!provider || !providerId || !email) {
    throw new Error("provider, providerId and email are required");
  }

  let user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      authProvider: provider.toUpperCase() === "GOOGLE" ? "GOOGLE" : "LOCAL",
      emailVerified: true
    });
  }

  return {
    user,
    token: signToken(user)
  };
}

module.exports = {
  register,
  login,
  verifyEmail,
  sendPhoneOtp,
  verifyPhone,
  oauthLogin
};

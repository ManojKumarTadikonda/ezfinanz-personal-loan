require("dotenv").config();

const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

async function seed() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@ezfinanz.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await User.findOneAndUpdate(
    { email },
    {
      name: "EZFINANZ Admin",
      email,
      passwordHash,
      role: "ADMIN",
      authProvider: "LOCAL",
      emailVerified: true,
      phoneVerified: true
    },
    { new: true, upsert: true }
  );

  console.log("Admin created/updated:");
  console.log({
    email: admin.email,
    password,
    role: admin.role
  });

  process.exit(0);
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const notificationRoutes =require("./routes/notification.routes");
const authRoutes = require("./routes/auth.routes");
const kycRoutes = require("./routes/kyc.routes");
const loanRoutes = require("./routes/loan.routes");
const bankRoutes = require("./routes/bank.routes");
const applicationRoutes = require("./routes/application.routes");
const adminRoutes = require("./routes/admin.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
// app.use(cors({
//   origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true,
//   credentials: true
// }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://frontend-dusky-sigma-yzh1by759m.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication requests. Try again later." }
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "ezfinanz-personal-loan-api",
    status: "healthy"
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/bank-accounts", bankRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications",notificationRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

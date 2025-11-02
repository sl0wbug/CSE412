// backend/server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const usersFile = path.join(__dirname, "users.json");

function readUsers() {
  if (!fs.existsSync(usersFile)) return {};
  return JSON.parse(fs.readFileSync(usersFile, "utf8") || "{}");
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// REGISTER new user
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  if (users[email]) {
    return res.status(400).json({ message: "User already exists" });
  }

  users[email] = { password, portfolio: {} };
  saveUsers(users);
  res.json({ message: "Registration successful!" });
});

// LOGIN existing user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  if (!users[email] || users[email].password !== password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ message: "Login successful" });
});

// SAVE portfolio
app.post("/savePortfolio", (req, res) => {
  const { email, portfolio } = req.body;
  const users = readUsers();

  if (!users[email]) return res.status(404).json({ message: "User not found" });

  users[email].portfolio = portfolio;
  saveUsers(users);
  res.json({ message: "Portfolio saved successfully" });
});

// GET portfolio
app.get("/getPortfolio/:email", (req, res) => {
  const email = req.params.email;
  const users = readUsers();

  if (!users[email]) return res.status(404).json({ message: "User not found" });

  res.json(users[email].portfolio || {});
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

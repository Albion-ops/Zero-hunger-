// server.js - plain Node.js server (no frameworks) serving static files and simple API endpoints
const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const url = require("url");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const DB_CONFIG = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "zerohunger_db",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
};

const pool = mysql.createPool({
  connectionLimit: 5,
  ...DB_CONFIG,
});

// helpers
function sendJSON(res, status, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
  });
  res.end(data);
}

function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[<>\"'&]/g, function (match) {
    const escape = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "&": "&amp;",
    };
    return escape[match];
  });
}

// Authentication helpers
function generateSessionId() {
  return uuidv4();
}

function getSessionFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});
  return cookies.sessionId || null;
}

function setSessionCookie(res, sessionId) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  res.setHeader(
    "Set-Cookie",
    `sessionId=${sessionId}; HttpOnly; Path=/; Expires=${expires.toUTCString()}; SameSite=Strict`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    "sessionId=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
}

async function createSession(userId) {
  return new Promise((resolve, reject) => {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    pool.query(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
      [sessionId, userId, expiresAt],
      (err, result) => {
        if (err) reject(err);
        else resolve(sessionId);
      }
    );
  });
}

async function validateSession(sessionId) {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT s.*, u.id, u.username, u.email, u.full_name, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > NOW() AND u.is_active = TRUE",
      [sessionId],
      (err, results) => {
        if (err) reject(err);
        else if (results.length === 0) resolve(null);
        else resolve(results[0]);
      }
    );
  });
}

async function deleteSession(sessionId) {
  return new Promise((resolve, reject) => {
    pool.query(
      "DELETE FROM sessions WHERE id = ?",
      [sessionId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

function serveStaticFile(req, res, filepath) {
  fs.readFile(filepath, function (err, data) {
    if (err) {
      res.writeHead(404, {
        "Content-Type": "text/plain",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filepath).toLowerCase();
    const mime =
      {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
      }[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mime,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    res.end(data);
  });
}

// routing
const publicDir = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // Handle CORS preflight requests
  if (method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  // API: POST /api/resources -> create resource
  if (method === "POST" && parsedUrl.pathname === "/api/resources") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { name, phone, email, location, food_type, quantity, notes } =
          data;

        // Validate required fields
        if (!name || !location || !food_type) {
          sendJSON(res, 400, {
            error: "name, location, and food_type are required",
          });
          return;
        }

        // Sanitize inputs
        const sanitizedData = {
          name: sanitizeInput(name).substring(0, 255),
          phone: sanitizeInput(phone).substring(0, 50),
          email: sanitizeInput(email).substring(0, 255),
          location: sanitizeInput(location).substring(0, 255),
          food_type: sanitizeInput(food_type).substring(0, 255),
          quantity: sanitizeInput(quantity).substring(0, 100),
          notes: sanitizeInput(notes).substring(0, 1000),
        };

        pool.query(
          "INSERT INTO resources (name,phone,email,location,food_type,quantity,notes) VALUES (?,?,?,?,?,?,?)",
          [
            sanitizedData.name,
            sanitizedData.phone,
            sanitizedData.email,
            sanitizedData.location,
            sanitizedData.food_type,
            sanitizedData.quantity,
            sanitizedData.notes,
          ],
          (err, result) => {
            if (err) {
              console.error("Database error:", err);
              sendJSON(res, 500, {
                error: "Database error",
                details:
                  process.env.NODE_ENV === "development"
                    ? err.message
                    : "Internal server error",
              });
              return;
            }
            sendJSON(res, 201, { success: true, id: result.insertId });
          }
        );
      } catch (e) {
        console.error("JSON parse error:", e);
        sendJSON(res, 400, { error: "Invalid JSON format" });
      }
    });
    return;
  }

  // API: GET /api/resources -> list resources
  if (method === "GET" && parsedUrl.pathname === "/api/resources") {
    pool.query(
      "SELECT * FROM resources ORDER BY submitted_at DESC LIMIT 500",
      (err, rows) => {
        if (err) {
          console.error("Database error:", err);
          sendJSON(res, 500, {
            error: "Database error",
            details:
              process.env.NODE_ENV === "development"
                ? err.message
                : "Internal server error",
          });
          return;
        }
        sendJSON(res, 200, rows);
      }
    );
    return;
  }

  // API: POST /api/auth/register -> register new user
  if (method === "POST" && parsedUrl.pathname === "/api/auth/register") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const { username, email, password, full_name } = data;

        // Validate required fields
        if (!username || !email || !password) {
          sendJSON(res, 400, {
            error: "username, email, and password are required",
          });
          return;
        }

        // Validate password strength
        if (password.length < 6) {
          sendJSON(res, 400, {
            error: "Password must be at least 6 characters long",
          });
          return;
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user
        pool.query(
          "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
          [
            sanitizeInput(username),
            sanitizeInput(email),
            passwordHash,
            sanitizeInput(full_name || ""),
          ],
          (err, result) => {
            if (err) {
              console.error("Registration error:", err);
              if (err.code === "ER_DUP_ENTRY") {
                sendJSON(res, 400, {
                  error: "Username or email already exists",
                });
              } else {
                sendJSON(res, 500, {
                  error: "Registration failed",
                  details:
                    process.env.NODE_ENV === "development"
                      ? err.message
                      : "Internal server error",
                });
              }
              return;
            }

            // Create session
            createSession(result.insertId)
              .then((sessionId) => {
                setSessionCookie(res, sessionId);
                sendJSON(res, 201, {
                  success: true,
                  message: "User registered successfully",
                  user: { id: result.insertId, username, email, full_name },
                });
              })
              .catch((sessionErr) => {
                console.error("Session creation error:", sessionErr);
                sendJSON(res, 500, {
                  error: "Registration successful but session creation failed",
                });
              });
          }
        );
      } catch (e) {
        console.error("Registration JSON parse error:", e);
        sendJSON(res, 400, { error: "Invalid JSON format" });
      }
    });
    return;
  }

  // API: POST /api/auth/login -> login user
  if (method === "POST" && parsedUrl.pathname === "/api/auth/login") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const { username, password } = data;

        if (!username || !password) {
          sendJSON(res, 400, {
            error: "username and password are required",
          });
          return;
        }

        // Find user
        pool.query(
          "SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE",
          [sanitizeInput(username), sanitizeInput(username)],
          async (err, results) => {
            if (err) {
              console.error("Login error:", err);
              sendJSON(res, 500, {
                error: "Login failed",
                details:
                  process.env.NODE_ENV === "development"
                    ? err.message
                    : "Internal server error",
              });
              return;
            }

            if (results.length === 0) {
              sendJSON(res, 401, { error: "Invalid username or password" });
              return;
            }

            const user = results[0];

            // Verify password
            const passwordMatch = await bcrypt.compare(
              password,
              user.password_hash
            );
            if (!passwordMatch) {
              sendJSON(res, 401, { error: "Invalid username or password" });
              return;
            }

            // Update last login
            pool.query(
              "UPDATE users SET last_login = NOW() WHERE id = ?",
              [user.id],
              (err) => {
                if (err) console.error("Last login update error:", err);
              }
            );

            // Create session
            try {
              const sessionId = await createSession(user.id);
              setSessionCookie(res, sessionId);
              sendJSON(res, 200, {
                success: true,
                message: "Login successful",
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  full_name: user.full_name,
                  role: user.role,
                },
              });
            } catch (sessionErr) {
              console.error("Session creation error:", sessionErr);
              sendJSON(res, 500, {
                error: "Login successful but session creation failed",
              });
            }
          }
        );
      } catch (e) {
        console.error("Login JSON parse error:", e);
        sendJSON(res, 400, { error: "Invalid JSON format" });
      }
    });
    return;
  }

  // API: POST /api/auth/logout -> logout user
  if (method === "POST" && parsedUrl.pathname === "/api/auth/logout") {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    if (sessionId) {
      deleteSession(sessionId)
        .catch((err) => {
          console.error("Logout error:", err);
        })
        .finally(() => {
          clearSessionCookie(res);
          sendJSON(res, 200, {
            success: true,
            message: "Logged out successfully",
          });
        });
      return;
    }
    clearSessionCookie(res);
    sendJSON(res, 200, { success: true, message: "Logged out successfully" });
    return;
  }

  // API: GET /api/auth/me -> get current user
  if (method === "GET" && parsedUrl.pathname === "/api/auth/me") {
    const sessionId = getSessionFromCookie(req.headers.cookie);
    if (!sessionId) {
      sendJSON(res, 401, { error: "Not authenticated" });
      return;
    }

    validateSession(sessionId)
      .then((session) => {
        if (!session) {
          sendJSON(res, 401, { error: "Invalid or expired session" });
          return;
        }
        sendJSON(res, 200, {
          user: {
            id: session.id,
            username: session.username,
            email: session.email,
            full_name: session.full_name,
            role: session.role,
          },
        });
      })
      .catch((err) => {
        console.error("Session validation error:", err);
        sendJSON(res, 500, { error: "Session validation failed" });
      });
    return;
  }

  // serve static files (default to index.html)
  let filepath = path.join(
    publicDir,
    parsedUrl.pathname === "/"
      ? "index.html"
      : parsedUrl.pathname.replace(/^\//, "")
  );
  // if requesting a directory, append index.html
  if (filepath.endsWith(path.sep)) filepath = path.join(filepath, "index.html");
  // normalize and disallow path traversal
  if (!filepath.startsWith(publicDir)) {
    res.writeHead(403, {
      "Content-Type": "text/plain",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
    res.end("Forbidden");
    return;
  }
  // if file doesn't exist, try adding .html
  if (!fs.existsSync(filepath)) {
    if (fs.existsSync(filepath + ".html")) filepath = filepath + ".html";
    else {
      res.writeHead(404, {
        "Content-Type": "text/plain",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      });
      res.end("Not found");
      return;
    }
  }
  serveStaticFile(req, res, filepath);
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    console.error("Please check your database configuration in .env file");
    process.exit(1);
  }
  console.log("Database connected successfully");
  connection.release();
});

server.listen(PORT, () => {
  console.log(`Zero Hunger Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Database: ${DB_CONFIG.database}@${DB_CONFIG.host}:${DB_CONFIG.port}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    pool.end(() => {
      console.log("Database connections closed");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    pool.end(() => {
      console.log("Database connections closed");
      process.exit(0);
    });
  });
});

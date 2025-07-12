const jwt = require("jsonwebtoken");
require("dotenv").config({ path: __dirname + "/../.env" });
console.log("MIDDLEWARE JWT_SECRET:", process.env.JWT_SECRET);

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "No auth header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = authMiddleware;

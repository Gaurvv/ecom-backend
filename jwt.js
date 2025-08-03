const jwt = require("jsonwebtoken");

const jwtAuthMiddleWare = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) res.status(401).json({ message: "unauthorized" });
  const token = auth.split(" ")[1];
  if (!token)
    return res.status(401).json({
      message: "unauthorized",
    });
  try {
    const decoded = jwt.verify(token, process.env.secret_key );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "invalid token" });
  }
};

const generateJwtToken = (userDetail) => {
    return jwt.sign(userDetail, process.env.secret_key)
};

module.exports = { jwtAuthMiddleWare, generateJwtToken }
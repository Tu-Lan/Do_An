import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // console.log("Authorization Header:", authHeader); 
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.log("Token verification failed:", error); 
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};

export default authUser;
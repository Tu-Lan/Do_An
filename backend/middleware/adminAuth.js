import jwt from 'jsonwebtoken';

const adminAuth = (req, res, next) => {
    // console.log("Authorization Header:", req.headers.authorization); // Log header
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      console.log("Token missing");
      return res.status(401).json({ message: "Unauthorized, token missing" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   console.log("Decoded Token:", decoded); // Log payload
      if (decoded.role !== 'admin') {
        console.log("Role is not admin");
        return res.status(403).json({ message: "Forbidden, admin access required" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Token Verification Error:", error.message);
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
  };
  

export default adminAuth;
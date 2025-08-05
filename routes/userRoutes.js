const express = require("express");
const route = express.Router();
const User = require("../model/userModal");
const { generateJwtToken, jwtAuthMiddleWare } = require("../jwt");

// ✅ Signup Route
route.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    const payload = {
      id: user.id,
      userName: user.userName,
      email: user.email,
    };

    user.token = generateJwtToken(payload);
    await user.save();

    res.status(200).json({
      message: "User created successfully",
      response: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: `Duplicate value for field: ${Object.keys(error.keyValue)[0]}`,
        field: error.keyValue,
      });
    }
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// ✅ Login Route
route.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ userName });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const payload = {
      id: user.id,
      userName: user.userName,
      email: user.email,
    };

    user.token = generateJwtToken(payload);
    await user.save();

    res.status(200).json({
      message: "Login successful",
      response: user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


route.patch("/user", jwtAuthMiddleWare, async (req, res) => {
  try {
    const { ...updatedData } = req.body;
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(userId,updatedData,{
      new:true,
    })
  
    await user.save();
    res.status(200).json({ message: "updated sucessfully",user:user }

    );
  } catch (error) {
    res.status(500).json({
      messsage: "Server Error",
      error: error,
    });
  }
});


route.patch("/password", jwtAuthMiddleWare, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ✅ Delete Account (Now using JWT)
route.delete("/delete", jwtAuthMiddleWare, async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = route;

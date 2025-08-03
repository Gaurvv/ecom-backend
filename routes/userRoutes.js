const express = require("express");
const route = express.Router();
const User = require("../model/userModal");
const { generateJwtToken } = require("../jwt");

// Signup route
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

// Login route
route.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Validation
    if (!userName || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // Find user by userName
    const user = await User.findOne({ userName: userName });
    
    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Compare password using the method from your user model
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Generate new token
    const payload = {
      id: user.id,
      userName: user.userName,
      email: user.email,
    };

    const newToken = generateJwtToken(payload);
    
    // Update user's token in database
    user.token = newToken;
    await user.save();

    // Return success response (same structure as signup)
    res.status(200).json({
      message: "Login successful",
      response: user,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Update user details route
route.put("/update", async (req, res) => {
  try {
    const { token, ...updateData } = req.body;

    console.log("Update request received:", { token: token ? "exists" : "missing", updateData });

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    // Find user by token
    const user = await User.findOne({ token: token });
    
    console.log("User found:", user ? "yes" : "no");
    
    if (!user) {
      return res.status(401).json({
        message: "Invalid token or user not found",
      });
    }

    // Update user fields (only the ones provided)
    const allowedUpdates = ['userName', 'email', 'contactNumber', 'city', 'street', 'deliveryDescription'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== '') {
        updates[field] = updateData[field];
      }
    });

    console.log("Updates to apply:", updates);

    // Check for duplicate userName or email if they're being updated
    if (updates.userName && updates.userName !== user.userName) {
      const existingUser = await User.findOne({ userName: updates.userName, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({
          message: "Username already exists",
        });
      }
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    // Update user
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    await user.save();

    console.log("User updated successfully");

    res.status(200).json({
      message: "User updated successfully",
      response: user,
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Change password route
route.put("/change-password", async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;

    if (!token || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Token, current password, and new password are required",
      });
    }

    // Find user by token
    const user = await User.findOne({ token: token });
    
    if (!user) {
      return res.status(401).json({
        message: "Invalid token or user not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
      response: user,
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Delete account route
route.delete("/delete", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        message: "Token is required",
      });
    }

    // Find and delete user by token
    const user = await User.findOneAndDelete({ token: token });
    
    if (!user) {
      return res.status(401).json({
        message: "Invalid token or user not found",
      });
    }

    res.status(200).json({
      message: "Account deleted successfully",
    });

  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

module.exports = route;
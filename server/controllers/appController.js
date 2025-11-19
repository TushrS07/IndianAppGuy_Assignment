// import User from "../models/User.js";
// import jwt from "jsonwebtoken";
// import transport from "../config/email.js";
// import generateOTP from "../services/otpGenerator.js";
// import dotenv from "dotenv";


// const generateJwt = (userId, expires) =>
//   jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: expires,
//   });

//   const setTokenCookie = (res, token, expiryMs) => {
//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: expiryMs,
//     sameSite: "strict",
//   });
// };

// const setOtpTokenCookie = (res, token) => {
//   res.cookie("otpToken", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 15 * 60 * 1000, // 15 mins
//     sameSite: "strict",
//   });
// };



// dotenv.config();


// // ----------------------------
// // SIGN UP
// // ----------------------------

// export const signUp = async (req, res) => {
//   try {
//     const { name, email, password, fitnessGoal } = req.body;

//     if (!name || !email || !password)
//       return res.status(400).json({
//         success: false,
//         message: "Name, email, and password are required.",
//       });

//     const existing = await User.findOne({ email });

//     if (existing)
//       return res.status(409).json({
//         success: false,
//         message: "Email already registered.",
//       });

//     const otp = generateOTP();

//     const user = await User.create({
//       name,
//       email,
//       password,
//       fitnessGoal: fitnessGoal || "General Fitness",
//       otp,
//       isVerified: false,
//     });

//     // mail OTP
//     await transport.sendMail({
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Your OTP Code - Fitness App",
//       text: `Your OTP is: ${otp}`,
//     });

//     // Create OTP session using only userId
//     const otpToken = generateJwt(user._id, "15m");
//     setOtpTokenCookie(res, otpToken);

//     res.status(201).json({
//       success: true,
//       message: "OTP sent successfully.",
//     });
//   } catch (error) {
//     console.error("Sign-up error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during registration.",
//     });
//   }
// };


// // ----------------------------
// // RESEND OTP
// // ----------------------------

// export const resendOtp = async (req, res) => {
//   try {
//     const otpToken = req.cookies?.otpToken;

//     if (!otpToken)
//       return res.status(400).json({
//         success: false,
//         message: "OTP session expired. Please sign up again.",
//       });

//     const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id);
//     if (!user)
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });

//     // Generate new OTP
//     const otp = generateOTP();
//     user.otp = otp;
//     await user.save();

//     await transport.sendMail({
//       from: process.env.EMAIL,
//       to: user.email,
//       subject: "Your New OTP Code - Fitness App",
//       text: `Your new OTP is: ${otp}`,
//     });

//     return res.json({
//       success: true,
//       message: "New OTP sent.",
//     });
//   } catch (error) {
//     console.error("Resend OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error.",
//     });
//   }
// };



// // ----------------------------
// // VERIFY OTP
// // ----------------------------

// export const verifyOtp = async (req, res) => {
//   try {
//     const { otp } = req.body;
//     const otpToken = req.cookies?.otpToken;

//     if (!otpToken)
//       return res.status(400).json({
//         success: false,
//         message: "Session expired. Please sign up again.",
//       });

//     const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id).select("+otp");
//     if (!user)
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });

//     if (user.otp !== otp)
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP.",
//       });

//     // Mark verified + clear OTP
//     user.isVerified = true;
//     user.otp = null;
//     await user.save();

//     // Login token
//     const token = generateJwt(user._id, "7d");
//     setTokenCookie(res, token, 7 * 24 * 60 * 60 * 1000);

//     res.clearCookie("otpToken");

//     return res.json({
//       success: true,
//       message: "OTP verified successfully.",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Verify OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during OTP verification.",
//     });
//   }
// };


// // ----------------------------
// // SAVE PROFILE
// // ----------------------------

// export const saveProfile = async (req, res) => {
//   try {
//     // User is already authenticated via middleware
//     const userId = req.user._id;
//     const profileData = req.body;

//     console.log("Request body for profile update:", req.body);

//     // Update profile data
//     req.user.profileData = profileData;
//     await req.user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Profile details updated successfully.",
//       user: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         fitnessGoal: req.user.fitnessGoal,
//         profileData: req.user.profileData,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error in updating profile details.",
//       error: error.message
//     });
//   }
// };


// // 📌 Fetch User Profile (Post-Login)
// export const getProfile = async (req, res) => {
//   try {
//     // User is already authenticated via middleware
//     res.status(200).json({
//       success: true,
//       user: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         fitnessGoal: req.user.fitnessGoal,
//         isVerified: req.user.isVerified,
//         profileData: req.user.profileData,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     res.status(500).json({ success: false, message: "Server error in fetching details." });
//   }
// };



// // ----------------------------
// // SIGN IN
// // ----------------------------

// export const signIn = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");
//     if (!user)
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email or password.",
//       });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch)
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email or password.",
//       });

//     if (!user.isVerified)
//       return res
//         .status(401)
//         .json({ success: false, message: "Please verify your email first." });

//     const token = generateJwt(user._id, "7d");
//     setTokenCookie(res, token, 7 * 24 * 60 * 60 * 1000);

//     return res.json({
//       success: true,
//       message: "Login successful.",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Login failed.",
//     });
//   }
// };

// // ----------------------------
// // LOGOUT
// // ----------------------------
// export const logout = (req, res) => {
//   res.clearCookie("token");
//   res.json({ success: true, message: "Logged out successfully." });
// };


import User from "../models/User.js";
import FitnessPlan from "../models/FitnessPlan.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transport from "../config/email.js";
import generateOTP from "../services/otpGenerator.js";
import dotenv from "dotenv";

dotenv.config();

// ----------------------------
// JWT & COOKIE HELPERS
// ----------------------------

const generateJwt = (userId, expires) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: expires,
  });

const setTokenCookie = (res, token, expiryMs) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: expiryMs,
    sameSite: "strict",
  });
};

const setOtpTokenCookie = (res, token) => {
  res.cookie("otpToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 mins
    sameSite: "strict",
  });
};

// ----------------------------
// SIGN UP
// ----------------------------

export const signUp = async (req, res) => {
  try {
    const { name, email, password, fitnessGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existing = await User.findOne({ email });

    // If user exists and is already verified, reject signup
    if (existing && existing.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please sign in instead.",
      });
    }

    let user;
    let otp;

    // If user exists but NOT verified, resend OTP
    if (existing && !existing.isVerified) {
      user = existing;
      otp = generateOTP();
      
      // Update user details if provided differently
      user.name = name;
      user.password = password; // Will be hashed by pre-save hook
      user.fitnessGoal = fitnessGoal || user.fitnessGoal || "General Fitness";
      user.otp = otp;
      await user.save();

      console.log(`Resending OTP to unverified user: ${email}`);
    } else {
      // Create new user
      otp = generateOTP();
      user = await User.create({
        name,
        email,
        password,
        fitnessGoal: fitnessGoal || "General Fitness",
        otp,
        isVerified: false,
      });

      console.log(`New user created: ${email}`);
    }

    // Send OTP email
    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code - Fitness App",
      text: `Your OTP is: ${otp}. This code will expire in 15 minutes.`,
    });

    // Create OTP session token
    const otpToken = generateJwt(user._id, "15m");
    setOtpTokenCookie(res, otpToken);

    return res.status(201).json({
      success: true,
      message: existing && !existing.isVerified 
        ? "Email not verified yet. New OTP sent to your email." 
        : "OTP sent successfully.",
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ----------------------------
// RESEND OTP
// ----------------------------

export const resendOtp = async (req, res) => {
  try {
    const otpToken = req.cookies?.otpToken;

    if (!otpToken) {
      return res.status(400).json({
        success: false,
        message: "OTP session expired. Please sign up again.",
      });
    }

    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    await user.save();

    // Send new OTP email
    await transport.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your New OTP Code - Fitness App",
      text: `Your new OTP is: ${otp}. This code will expire in 15 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ----------------------------
// VERIFY OTP
// ----------------------------

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const otpToken = req.cookies?.otpToken;

    if (!otpToken) {
      return res.status(400).json({
        success: false,
        message: "Session expired. Please sign up again.",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("+otp");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Mark verified + clear OTP
    user.isVerified = true;
    user.otp = null;
    await user.save();

    // Generate login token
    const token = generateJwt(user._id, "7d");
    setTokenCookie(res, token, 7 * 24 * 60 * 60 * 1000);

    // Clear OTP token
    res.clearCookie("otpToken");

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fitnessGoal: user.fitnessGoal,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification.",
    });
  }
};

// ----------------------------
// SIGN IN
// ----------------------------

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // If user is not verified, send new OTP and require verification
    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      await user.save();

      // Send OTP email
      await transport.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Email - Fitness App",
        text: `Your OTP is: ${otp}. Please verify your email to continue.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Email Verification Required</h2>
            <p>Please verify your email to access your account. Your OTP code is:</p>
            <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes.</p>
          </div>
        `,
      });

      // Create OTP session token
      const otpToken = generateJwt(user._id, "15m");
      setOtpTokenCookie(res, otpToken);

      return res.status(401).json({
        success: false,
        message: "Please verify your email first. A new OTP has been sent.",
        requiresVerification: true,
      });
    }

    const token = generateJwt(user._id, "7d");
    setTokenCookie(res, token, 7 * 24 * 60 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        fitnessGoal: user.fitnessGoal,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// ----------------------------
// SAVE PROFILE (Protected Route)
// ----------------------------

export const saveProfile = async (req, res) => {
  try {
    const profileData = req.body;

    if (!profileData || Object.keys(profileData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Profile data is required.",
      });
    }

    console.log("Updating profile for user:", req.user._id);

    // Update profile data
    req.user.profileData = profileData;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile details updated successfully.",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        fitnessGoal: req.user.fitnessGoal,
        profileData: req.user.profileData,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in updating profile details.",
      error: error.message,
    });
  }
};

// ----------------------------
// GET PROFILE (Protected Route)
// ----------------------------

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        fitnessGoal: req.user.fitnessGoal,
        isVerified: req.user.isVerified,
        profileData: req.user.profileData,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in fetching details.",
    });
  }
};

// ----------------------------
// LOGOUT
// ----------------------------

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.clearCookie("otpToken");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
};
const user = require("../model/user");
const jsonwebtoken = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const doctor = require("../model/doctor");
const OTP = require("../model/otp");

const { default: mongoose } = require("mongoose");
const {
  signupSchema,
  signinSchema,
  doctorSignupSchema,
  doctorSigninSchema,
} = require("../validation/authvalidators");
const { sendOTP } = require("../utils/otp"); // utility function to send OTP

// Predefined admin credentials
const adminEmail = "admin@yopmail.com";
const adminPassword = "Admin@123";

const signin = async (req, res) => {
  try {
    const { error } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { username, password } = req.body;
    const auth_user = await user.findOne({ username });
    if (!auth_user) {
      return res.status(401).json({ message: `user with ${username} not found` });
    }

    if (!auth_user.verified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.create({ phone: auth_user.phone, otp, verified: false });
      await sendOTP(auth_user.phone, otp);
      return res.status(403).json({ message: "User not verified. OTP sent to phone number." });
    }

    const verify = await bcryptjs.compare(password, auth_user.password);
    if (!verify) {
      return res.status(401).json({ message: "username or password incorrect" });
    }

    const token = jsonwebtoken.sign({ auth_user }, process.env.SECRET_KEY, {
      expiresIn: "5h",
    });
    res.cookie("authorization", `Bearer ${token}`);
    return res.status(200).json({
      token: `Bearer ${token}`,
      user: auth_user,
      message: "login successfully",
      // data: req.body,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const doctorsignin = async (req, res) => {
  try {
    const { error } = doctorSigninSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = req.body;
    const auth_user = await doctor.findOne({ email });
    if (!auth_user) {
      return res.status(401).json({ message: `user with ${email} not found` });
    }
    const verify = await bcryptjs.compare(password, auth_user.password);
    if (!verify) {
      return res.status(401).json({ message: "email or password incorrect" });
    }
    const token = jsonwebtoken.sign({ auth_user }, process.env.SECRET_KEY, {
      expiresIn: "5h",
    });
    res.cookie("authorization", `Bearer ${token}`);
    return res
      .status(200)
      .json({ token: `Bearer ${token}`, user: auth_user, data: req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { username, password, email, gender, age, location, phone } =
      req.body;

    // Check if the user already exists
    const existingUser = await user.findOne({ username, email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create a new user in the database
    const newUser = await user.create({
      username,
      password: hashedPassword, // Save the hashed password
      email,
      gender,
      age,
      location,
      phone,
      verified: false, // Set verified to false initially
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Save OTP in OTP model
    await OTP.create({ phone, otp, verified: false });

    // Send OTP to the user's phone number
    await sendOTP(phone, otp);

    return res  
      .status(200)
      .json({
        message: "User created and OTP sent to phone number",
        data: newUser,
      });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
// Assuming you have an OTP model and twilio integration as discussed earlier
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Check if phone and otp are provided
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required" });
    }

    // Find the OTP in the database
    const savedOTP = await OTP.findOne({ phone });
    if (!savedOTP) {
      return res
        .status(404)
        .json({ message: "No OTP found for this phone number" });
    }

    // Compare OTPs
    console.log("Saved OTP:", savedOTP.otp);
    console.log("Received OTP:", otp);

    if (savedOTP.otp !== otp) {
      console.log("Incorrect OTP");
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // Check if the user exists before updating
    const auth_user = await user.findOne({ phone });
    if (!auth_user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User before update:", auth_user);

    // Update verified status to true in user model
    const updateResult = await user.updateOne(
      { phone },
      { $set: { verified: true } }
    );

    // Log the result of the update operation
    console.log("Update result:", updateResult);

    if (updateResult.nModified === 0) {
      console.log("User not updated");
      return res
        .status(500)
        .json({ message: "Failed to update user verification status" });
    }

    // Optionally, you can delete the OTP record after verification
    await OTP.deleteOne({ phone });

    // Fetch the updated user document
    const updatedUser = await user.findOne({ phone });
    console.log("User after update:", updatedUser);

    return res
      .status(200)
      .json({ message: "OTP verified successfully", user: updatedUser });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ message: error.message });
  }
};

const doctorsignup = async (req, res) => {
  try {
    const { error } = doctorSignupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const {
      name,
      expertise,
      image,
      email,
      password,
      contact,
      desc,
      date,
      ammount,
    } = req.body;
    const existingDoctor = await doctor.findOne({ email });
    if (!existingDoctor) {
      const hashed_password = await bcryptjs.hash(password, 8);
      await doctor.create({
        name,
        expertise,
        image,
        email,
        password: hashed_password,
        contact,
        desc,
        date,
        ammount,
        is_doctor: true,
      });
      return res
        .status(200)
        .json({ message: "Doctor created", data: req.body });
    } else {
      return res.status(409).json({ message: "Doctor already exist" });
    }
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};


// Admin signin function
const adminsignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email and password match the admin credentials
    if (email === adminEmail && password === adminPassword) {
      const token = jsonwebtoken.sign({ email }, process.env.SECRET_KEY, {
        expiresIn: "5h",
      });
      res.cookie("authorization", `Bearer ${token}`);
      return res.status(200).json({
        token: `Bearer ${token}`,
        message: "Admin login successfully",
        data:req.body
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password"});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  signin,
  signup,
  verifyOtp,
  doctorsignin,
  doctorsignup,
  adminsignin,
};

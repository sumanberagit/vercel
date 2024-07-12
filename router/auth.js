const express = require("express");
const auth_controller = require("../controller/auth");
const auth_router = express.Router();
auth_router.post("/signup", auth_controller.signup);
auth_router.post('/verify-otp', auth_controller.verifyOtp);

auth_router.post("/signin", auth_controller.signin);
auth_router.post("/doctorsignin", auth_controller.doctorsignin);
auth_router.post("/doctorsignup", auth_controller.doctorsignup);
auth_router.post("/adminsignin", auth_controller.adminsignin);


module.exports = auth_router;
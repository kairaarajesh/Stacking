const { request } = require('express');
const mongoose = require('mongoose');

 const usersShema = mongoose.Schema(
    {
        id: { type: Number, required: true },
        first_name: {type: String,unique: true},
        last_name: { type: String, required: true},
        gender: { type: String, required: false },
        dob: { type: String, required: false },
        mobile: { type: String, required: false },
        email: { type: String, required: true },
        alternate_mobile: { type: String, required: false },
        username: { type: String, required: false },
        creds: { type: String, required: false },
        transfer_pin: { type: String, required: false },
        role: {  type: String, default: false, },
        status: { type: String, required: false },
        last_login_at: { type: String, required: false },
        user_verified_at: {  type: String, default: false, },
        email_verified_at: { type: String, required: false },
        kyc_status: { type: String, required: false },
        kyc_comment: {  type: String, default: false, },
        kyc_reviewed_by: { type: String, required: false },
     }
    )
    const userModel = mongoose.model("User", usersShema);
         
module.exports = userModel;

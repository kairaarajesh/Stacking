const { request } = require('express');
const mongoose = require('mongoose');

 const adminShema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: {type: String,unique: true},
        password: { type: String, required: true, minLength: 6 },
        phone: { type: String, required: true },
        address: { type: String, required: false },
        role: {type: String,  enum: ["admin", "subadmin", "user"],  default: "admin", },
        permissions: {  type: [String], default: [],},
        status: {  type: Boolean, default: true, },
    }
 )
const adminModel = mongoose.model("Admin", adminShema);
 
module.exports = adminModel;

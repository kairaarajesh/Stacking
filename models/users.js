const { request } = require('express');
const mongoose = require('mongoose');


 const usersShema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: {type: String,unique: true},
        password: { type: String, required: true, minLength: 6 },
        phone: { type: String, required: true },
        address: { type: String, required: true },
    }
 )
const userModel = mongoose.model("User", usersShema);
 
module.exports = userModel;

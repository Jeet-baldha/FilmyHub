import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';



const userShecma = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    googleId:String,
    facebookId:String,
    watchList:[]
})

userShecma.plugin(passportLocalMongoose);

const User =  mongoose.model("user",userShecma);


export  default User;

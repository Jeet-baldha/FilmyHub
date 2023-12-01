import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';
import session from "express-session";
import findOrCreate from "find-or-create";


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


    function insert() {
        const user = new User({
            username:"Jeet"
        })

        console.log("Helo");
        user.save();
    }


export  default User;
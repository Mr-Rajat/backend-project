// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

// for import statement need to config this way
dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server started on http://localhost/${process.env.PORT}`);
    })
})
.catch((err)=> {
    console.log("MongoDB connection failed !!! ", err);
})


/* Approach one should not follow mainly
import express from "express"
const app = express();

;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}}`)

        app.on("error", (error) => {
            console.log("ERRR", error)
            throw error
        })

        app.listen(process.env.PORT, ()=> {
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    }catch(error){
        console.error("Error: ", error)
        throw error
    }
})

*/
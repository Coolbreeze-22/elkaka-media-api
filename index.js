import express from 'express'
// const express = require("express") the normal way for server side, but i am able to use import method bcos i changed type to module in package.json
import bodyParser from "body-parser"
import mongoose from "mongoose"
import cors from 'cors'
import dotenv from 'dotenv';
import postRouter from './routes/posts.js';
import userRouter from './routes/users.js';
import migrationRouter from './routes/migration.js';

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: '30mb', extended: true}));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true}));
app.use(cors());
app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/migration', migrationRouter);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL)
.then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
.catch((error) => console.log(error.message));


// try {
//     app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
// }  
// catch (error) {
//     console.log(error.message)
// }
// try is working like .then above, but catch is not showing the errors like .catch above

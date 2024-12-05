const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require('redis');
const RedisStore = require('connect-redis').RedisStore; 
const Redis = require('redis');
const cors = require("cors");

const { 
    MONGO_USER,
    MONGO_PASSWORD, 
    MONGO_IP, 
    MONGO_PORT, 
    REDIS_URL,
    SESSION_SECRET,
    REDIS_PORT,
} = require("./config/config");

const redisClient = redis.createClient({
    url: `redis://${REDIS_URL}:${REDIS_PORT}`
});

redisClient.connect().catch(console.error);


const postRouter = require("./routes/postRoute")
const userRouter = require("./routes/userRoute")

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
const connectWithRetry = () => { 
    mongoose
    .connect(mongoURL)
    .then(() => console.log("successfully connected to DB"))
    .catch((e) => { 
        console.log(e) 
        setTimeout(connectWithRetry, 5000)
    });

};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60000,
    }
}));

app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.send("<h2>Hi, there you Okay:) </h2>");
    console.log("Yeah it ran");
});

//localhost:3000/posts
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users",userRouter)

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
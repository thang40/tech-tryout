const path = require("path");
const express = require("express");
const session = require("express-session");
const app = express();
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const redis = require("redis");
const client = redis.createClient("redis://localhost:6378");

const mongoose = require("mongoose");
require("dotenv").config();

const port = process.env.PORT;
mongoose.connect(process.env.DB_URI, {
    autoReconnect: true,
});

mongoose.connection.on("error", function (err) {
    console.log("MongoDB Connection Error. Please make sure that MongoDB is running." + err);
});

client.on("error", function (error) {
    console.error(error);
});

client.set("key", "value", redis.print);
client.get("key", redis.print);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: process.env.AUTH_SECRET,
        resave: true,
        saveUninitialized: true,
    })
);

app.use("/graphql", graphqlHTTP({ schema: require("./schemas/schema.js"), graphiql: true }));

const auth = function (req, res, next) {
    if (req.session && req.session.user === process.env.AUTH_USERNAME) {
        return next();
    }
    return res.redirect("/auth");
};

app.get("/login", function (req, res) {
    if (!req.query.username || !req.query.password) {
        res.send("Invalid credentials");
    } else if (req.query.username === process.env.AUTH_USERNAME || req.query.password === process.env.AUTH_PASSWORD) {
        req.session.user = req.query.username;
        res.redirect("/");
    }
});

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("auth");
});

// app.get('/', auth, function(req, res) {
//     res.redirect('alpr-results');
// });

app.get("/", auth, function (req, res) {
    res.sendFile(path.join(__dirname + "/view/dashboard.html"));
});

app.get("/car-list", auth, function (req, res) {
    res.sendFile(path.join(__dirname + "/view/car-list.html"));
});

app.get("/car-details/:id", auth, function (req, res) {
    res.sendFile(path.join(__dirname + "/view/car-details.html"));
});

app.get("/auth", function (req, res) {
    res.sendFile(path.join(__dirname + "/view/login.html"));
});

const HomeController = require("./controller/home");

app.post("/populatePlates", HomeController.getPlates);

app.post("/updatePlate", HomeController.updatePlate);

app.listen(port, () => {});

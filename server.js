const path = require("path");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const { rateLimit } = require("express-rate-limit");
const port = process.env.PORT || 8002;
const cors = require("cors");
const { MongoClient } = require("mongodb");
const analyticsRoutes = require('./routes/analyticsRoutes');
const campaignsRoutes = require("./routes/campaignRoutes");

connectDB();

const app = express();



const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(
  cors({
    origin: "https://louderthanwords.netlify.app/",
  })
);

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(apiLimiter);

app.use("/api/campaigns", campaignsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get("/", (req, res) => {
  res.send(`API running on port ${port} - nice one!`);
});

client.connect((err) => {
  if (err) {
    console.error(err);
    return false;
  }
  // connection to mongo is successful, listen for requests
  app.listen(port, () => {
    console.log(`API running on port ${port} - nice one!`);
  });
});

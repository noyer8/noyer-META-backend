import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Noyer META Backend is running 🚀");
});

export default app;

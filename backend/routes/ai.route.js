const express = require("express");
const router = express.Router();
const main = require("../services/ai.service.js");  // No need for {} since you're using module.exports

router.post("/", async (req, res) => {
  const code = req.body.code;
  if (!code) return res.status(400).send("code is required");
  
  try {
    const response = await main(code);  // Await the response from main
    res.send(response);  // Send the response back to the client
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing request");
  }
});

module.exports = router;

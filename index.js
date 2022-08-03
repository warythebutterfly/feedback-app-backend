const express = require("express");
require('dotenv').config()
const app = express();
const pool = require("./db");
app.use(express.json());
const cors = require("cors");

app.use(
  cors({
    origin: process.env.REACT_APP_URL,
  })
);
//get all feedbacks
app.get("/feedbacks", async (req, res) => {
  try {
    const feedbacks = await pool.query(
      "select * from feedbacks order by id desc"
    );

    res.json({
      data: feedbacks.rows,
      message: `pulled records successfully of length ${feedbacks.rows.length}`,
    });
  } catch (error) {
    res.json(error.message);
  }
});

//get a feedback
app.get("/feedbacks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await pool.query("select * from feedbacks where id = $1", [
      id,
    ]);

    feedback.rowCount
      ? res.json(feedback.rows[0])
      : res.json({ data: "No feedback at the moment" });
  } catch (error) {
    res.json(error.message);
  }
});

//create a feedback
app.post("/feedbacks", async (req, res) => {
  try {
    
    const { subject, text, rating } = req.body;
    const feedbacks = await pool.query(
      "insert into feedbacks (subject, text, rating) values ($1, $2, $3) returning *",
      [subject, text, rating]
    );

    res.json({
      data: feedbacks.rows[0],
      message: "feedback added successfully",
    });
  } catch (error) {
    res.json(error.message);
  }
});

//update a feedback

app.put("/feedbacks", async (req, res) => {
  try {
   
    const { subject, text, rating, id } = req.body;
    try {
      const feedbacks = await pool.query(
        "update feedbacks set subject = $1, text = $2, rating = $3 where id = $4 returning *",
        [subject, text, rating, id]
      );
      
      res.json({
        statusCode: "00",
        data: feedbacks.rows[0],
        message: "Feedback updated successfully",
      });
    } catch (error) {
      res.json({
        statusCode: "02",
        //data: feedbacks.rows[0],
        message: error.message,
      });
    }
  } catch (error) {
    res.json(error.message);
  }
});

//delete a feedback
app.delete("/feedbacks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await pool.query("delete from feedbacks where id = $1", [id]);
      res.json({ statusCode: "00", message: "Feedback deleted successfully" });
    } catch (error) {
      res.json({ statusCode: "02", message: error.message });
    }
  } catch (error) {
    res.json(error.message);
  }
});

app.listen(5000, () => {
  console.log("server running on port 5000");
});

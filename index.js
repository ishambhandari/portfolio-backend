const express = require("express");
const pool = require("./db.js");
const multer = require("multer");
const cors = require("cors");
const upload = multer();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const imageUpload = multer({
  dest: "images",
  storage: storage,
});

// Applying middle wares

const app = express();
app.use(express.json());
app.use(express.static("images"));
app.use(cors({ credentials: true, origin: true }));

// Routes

// post route
app.post("/api/create", imageUpload.single("thumbnail"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const { filename, path } = req.file;
    const newPost = await pool.query(
      "INSERT INTO works (title, description, file_name, file_location) values($1,$2,$3,$4)",
      [title, description, filename, path]
    );
    res.json(newPost.rows);
  } catch (error) {
    res.status(500).send("Opps! something went wrong!");
  }
});

app.post("/api/work-images", imageUpload.single("photos"), async (req, res) => {
  try {
    const { work_id } = req.body;
    const { filename, path } = req.file;
    const imagePost = await pool.query(
      "INSERT INTO image_work (work_id, image_name, image_location) values($1,$2,$3)",
      [work_id, filename, path]
    );
    res.json(imagePost.rows);
  } catch (error) {
    console.log(error);
  }
});
// get route

app.get("/api/allworks", async (req, res) => {
  try {
    const getAllWork = await pool.query("SELECT * FROM works");
    res.json(getAllWork.rows);
  } catch (error) {
    res.status(500).send("Opps! something went wrong!");
  }
});

app.get("/api/allworks/:id", async (req, res) => {
  try {
    const getWork = await pool.query("SELECT * from works where id = $1", [
      req.params.id,
    ]);

    res.json(getWork.rows);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Opps! something went wrong!");
  }
});

app.get("/api/workimg/:id", async (req, res) => {
  try {
    const getWorkImg = await pool.query(
      "select * from image_work where work_id = $1",
      [req.params.id]
    );

    res.json(getWorkImg.rows);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Opps! something went wrong!");
  }
});

app.listen(5000, () => {
  console.log("server in port 5000");
});

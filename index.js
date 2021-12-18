const express = require("express");
const pool = require("./db.js");
const multer = require("multer");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
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
    console.log("d", work_id);
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
app.post("/api/mail", imageUpload.single("photos"), async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log("heyu", req.body);
    const htmlOutput = `
    <p>New Contact</p>
    <ul>
    <li>Name: ${name}</li>
    <li>email: ${email}</li>
    <li>message: ${message}</li>
    </ul>`;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      // secure: false, true for 465, false for other ports
      auth: {
        user: "ishambhandari007@gmail.com",
        // generated ethereal user
        pass: process.env.EMAIL_PASSWORD,

        // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOption = {
      from: `${name}`,
      to: "ishambhandari007@gmail.com",
      subject: "personal website contact",

      text: message,
      html: htmlOutput,
    };

    // send mail with defined transport object
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        return console.log("error", error);
      }
      console.log("message sent %s", info.messageId);
      res.status(200).send("success");
    });

    // console.log("Message sent: %s",);

    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("error", error);
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

app.listen(process.env.PORT || 5000, () => {
  console.log("server in port 5000");
});

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();


// ================= CORS =================
app.use(cors({
  origin: "https://vbomma.online"
}));

app.use(express.json());


// ================= 🔒 SECURITY MIDDLEWARE =================
app.use((req, res, next) => {

  const host = req.headers.host;

  // ✅ Allow Render internal checks (IMPORTANT)
  if (host && host.includes("onrender.com")) {
    return next();
  }

  // ✅ Allow your API domain
  if (host && host.includes("api.vbomma.online")) {
    return next();
  }

  // ❌ Block everything else
  return res.status(403).send("Blocked: Direct access not allowed");

});


// ================= PATH =================
const moviesPath = path.join(__dirname, "movies.json");


// ================= STATIC FOLDER =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= READ MOVIES =================
function readMovies() {
  return JSON.parse(fs.readFileSync(moviesPath, "utf-8"));
}


// ================= SAVE MOVIES =================
function saveMovies(movies) {
  fs.writeFileSync(moviesPath, JSON.stringify(movies, null, 2));
}


// ================= MULTER STORAGE =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("OTT Backend Running");
});


// ================= GET MOVIES =================
app.get("/movies", (req, res) => {
  const movies = readMovies();
  res.json(movies);
});


// ================= UPLOAD MOVIE =================
app.post("/upload", upload.single("movie"), (req, res) => {

  const movies = readMovies();

  const newMovie = {
    id: Date.now(),
    title: req.body.title,
    thumbnail: req.body.thumbnail,
    video: `/uploads/${req.file.filename}`
  };

  movies.push(newMovie);
  saveMovies(movies);

  res.status(201).json({
    message: "Movie Uploaded Successfully",
    movie: newMovie
  });

});


// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});

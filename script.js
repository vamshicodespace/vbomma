// ================= GLOBAL =================
let allMovies = [];

const moviesContainer = document.getElementById("movies");
const loader = document.getElementById("loader");


// ================= FETCH MOVIES (SMART CACHE) =================
const CACHE_KEY = "movies_cache";
const CACHE_TIME_KEY = "movies_cache_time";
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

const cachedData = localStorage.getItem(CACHE_KEY);
const cachedTime = Number(localStorage.getItem(CACHE_TIME_KEY));

if (cachedData && cachedTime && (Date.now() - cachedTime < CACHE_DURATION)) {

  // ⚡ Load from cache
  const data = JSON.parse(cachedData);
  allMovies = data;

  showMovies(data.slice(0, 25));
  loader.classList.add("hide");

  console.log("Loaded from cache ⚡");

} else {

  fetch("https://api.vbomma.online/movies")
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch movies");
      }
      return res.json();
    })
    .then(data => {

      allMovies = data;

      // Save cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now());

      showMovies(data.slice(0, 25));
      loader.classList.add("hide");

      console.log("Fetched from API 🌐");

    })
    .catch(err => {

      console.error("Error:", err);

      // ⚠️ Fallback to cache if available
      if (cachedData) {
        const data = JSON.parse(cachedData);
        allMovies = data;
        showMovies(data.slice(0, 25));
        console.log("Loaded fallback cache ⚠️");
      } else {
        moviesContainer.innerHTML =
          "<p style='text-align:center'>Failed to load movies</p>";
      }

      loader.classList.add("hide");
    });

}


// ================= SHOW MOVIES =================
function showMovies(movies) {

  moviesContainer.innerHTML = "";

  movies.forEach(movie => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
      <h3>${movie.title}</h3>
    `;

    // click → go to video page
    card.onclick = () => {
      window.location.href =
        `video.html?video=${encodeURIComponent(movie.video)}`
        + `&title=${encodeURIComponent(movie.title)}`
        + `&thumb=${encodeURIComponent(movie.thumbnail)}`
        + `&desc=${encodeURIComponent(movie.description || "Not available")}`
        + `&director=${encodeURIComponent(movie.director || "Not available")}`
        + `&year=${encodeURIComponent(movie.year || "Not available")}`
        + `&genre=${encodeURIComponent(movie.genre || "Not available")}`;
    };

    moviesContainer.appendChild(card);

  });
}


// ================= SEARCH =================
function searchMovies() {

  const text = document.getElementById("search").value.toLowerCase();

  const filtered = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(text)
  );

  showMovies(filtered);

}
import { TMDB_API_KEY } from "./config.js";

const searchQuery = new URLSearchParams(location.search);

const movieId = searchQuery.get("id");

if (!movieId) location.href = "./index.html";

const labels = ["data", "casts", "similar"];

(async () => {
  const result = (
    await Promise.all([
      (
        await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
        )
      ).json(),
      (
        await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
        )
      ).json(),
      (
        await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`
        )
      ).json(),
    ])
  ).reduce((final, current, index) => {
    if (labels[index] === "data") {
      final[labels[index]] = current;
    } else if (labels[index] === "casts") {
      final[labels[index]] = current.cast
        .filter((item) => item.name && item.character && item.profile_path)
        .slice(0, 10);
    } else if (labels[index] === "similar") {
      final[labels[index]] = current.results;
    }

    return final;
  }, {});

  console.log(result);

  document.querySelector(
    ".background-img"
  ).style.backgroundImage = `url('https://image.tmdb.org/t/p/original${result.data.backdrop_path}')`;

  document.querySelector(
    "#preview-img"
  ).src = `https://image.tmdb.org/t/p/w300${result.data.poster_path}`;
  document.querySelector("#movie-title").innerText =
    result.data.title || result.data.name;
  document.querySelector("#movie-description").innerText = result.data.overview;
  document.querySelector(
    "#watch-now-btn"
  ).href = `./watch.html?id=${result.data.id}`;

  if (result.data.release_date)
    document.querySelector(
      "#release-date"
    ).innerText = `Release Date: ${result.data.release_date}`;

  if (result.data.genres)
    document.querySelector("#genres").innerHTML = result.data.genres
      .map((genres) => `<span>${genres.name}</span>`)
      .join("");

  if (result.casts) {
    document.querySelector(".casts-grid").innerHTML = result.casts
      .map(
        (item) => /*html*/ `
          <div>
            <img
              onload="this.style.opacity = '1'"
              class="fade-in"
              src="https://image.tmdb.org/t/p/w200${item.profile_path}"
              alt=""
            />
            <p style="text-align: center">${item.name}</p>
            <p style="text-align: center; color: var(--orange)">${item.character}</p>
          </div>
        `
      )
      .join("");
  }

  if (result.similar && result.similar.length > 0)
    document.querySelector("#similar").innerHTML += /*html*/ `
  <div class="section">
    <h2>Similar</h2>

    <div class="swiper">
      <div class="swiper-wrapper">
        ${result.similar
          .map(
            (item) => /*html*/ `
        <a href="./info.html?id=${
          item.id
        }" class="swiper-slide" style="width: 200px !important">
          <div class="movie-card">
            <img
              class="fade-in"
              onload="this.style.opacity = '1'"
              src="https://image.tmdb.org/t/p/w200${item.poster_path}"
              alt=""
            />
            <p class="multiline-ellipsis-2">
              ${item.title || item.name}
            </p>
          </div>
        </a>
      `
          )
          .join("\n")} 
      </div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  </div>
  `;

  new Swiper(`.swiper`, {
    spaceBetween: 30,
    autoplay: { delay: 5000, disableOnInteraction: true },
    slidesPerView: "auto",
    loop: true,
    slidesPerGroupAuto: true,
    navigation: {
      prevEl: `.swiper-button-prev`,
      nextEl: `.swiper-button-next`,
    },
  });

  document.querySelector(".backdrop").classList.add("backdrop-hidden");

  document.title = `${result.data.title || result.data.name} - MindX Cinema`;
})();

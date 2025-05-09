import { TMDB_API_KEY } from "./config.js";

const searchQuery = new URLSearchParams(location.search);

const query = searchQuery.get("q")?.trim();

(async () => {
  if (query) {
    const data = await (
      await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
          query
        )}&api_key=${TMDB_API_KEY}`
      )
    ).json();

    console.log(data);

    document.querySelector("form").style.display = "none";
    document.querySelector("#movie-grid").style.display = "grid";

    document.querySelector("#movie-grid").innerHTML = /*html*/ `
    <h1 className="text-2xl mb-8">
      Search result for '${query}'</h1>
    <div
    >
      ${data.results
        .map(
          (item) => /*html*/ `
            <a href="./info.html?id=${item.id}" >
              <div class="movie-card">
                <img
                  style="width: auto; height: auto; aspect-ratio: 2/3"
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
        .join("")}
    </div>
  `;
  }

  document.querySelector(".backdrop").classList.add("backdrop-hidden");
})();

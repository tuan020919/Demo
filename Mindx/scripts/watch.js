import { TMDB_API_KEY } from "./config.js";

const calculateElapsedTime = (timeCreated) => {
  const created = new Date(timeCreated).getTime();
  let periods = {
    year: 365 * 30 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
  };
  let diff = Date.now() - created;

  for (const key in periods) {
    if (diff >= periods[key]) {
      let result = Math.floor(diff / periods[key]);
      return `${result} ${result === 1 ? key : key + "s"} ago`;
    }
  }

  return "Just now";
};

const searchQuery = new URLSearchParams(location.search);

const movieId = searchQuery.get("id");

if (!movieId) location.href = "./index.html";

const labels = ["data", "similar"];

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
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`
        )
      ).json(),
    ])
  ).reduce((final, current, index) => {
    if (labels[index] === "data") {
      final[labels[index]] = current;
    } else if (labels[index] === "similar") {
      final[labels[index]] = current.results;
    }

    return final;
  }, {});

  console.log(result);

  document.querySelector(
    "iframe"
  ).src = `https://www.2embed.cc/embed/${result.data.id}`;
  document.querySelector("#movie-title").innerText =
    result.data.title || result.data.name;
  document.querySelector("#movie-description").innerText = result.data.overview;

  if (result.data.release_date)
    document.querySelector(
      "#release-date"
    ).innerText = `Release Date: ${result.data.release_date}`;

  if (result.similar && result.similar.length > 0)
    document.querySelector("#similar").innerHTML += /*html*/ `
    <h1 className="text-xl">Similar Movies</h1>
    ${result.similar
      .map(
        (item) => /*html*/ `<a href="./info.html?id=${item.id}">
          <div>
            <img
              onload="this.style.opacity = '1'"
              alt=""
              src="https://image.tmdb.org/t/p/w200${item.poster_path}"
            />
            <div>
              <p>${item.title}</p>
            </div>
          </div>
        </a>`
      )
      .join("")} 
  `;

  
  const user = JSON.parse(localStorage.getItem("currentUser"));

  ///// Lập trình tính năng comment trong trang
  document.querySelector("#comment-box-container").innerHTML = /*html*/ `
  <form ${
    !user ? 'style="cursor: pointer" onclick="signIn()"' : ""
  } class="comment-form" autocomplete="off">
    <img src="${
      user
        ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            user?.username
          )}`
        : `./assets/default-avatar.png`
    }" />

    <div ${!user ? "onclick='location.href = \"./login.html\"'" : ""}>
      <input
        required
        type="text"
        placeholder="${
          user ? `Comment as ${user.username}` : "Sign in to comment"
        }"
        id="comment"
        name="comment"
        ${user ? "" : "style='pointer-events: none'"}
      />
      <button type="submit"
        ${user ? "" : 'style="display: none"'}
       ><i class="fa-solid fa-paper-plane"></i></button>
    </div>
  </form>
  `;

  const form = document.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = e.target.comment.value.trim();

    e.target.comment.value = "";

    const existingComments = JSON.parse(
      localStorage.getItem(`comments-${movieId}`) || "[]"
    );

    existingComments.push({
      title,
      user: {
        username: user.username,
      },
      createdAt: Date.now(),
    });

    localStorage.setItem(
      `comments-${movieId}`,
      JSON.stringify(existingComments)
    );

    renderComments();
  });

  window.renderComments = () => {
    let out = "";

    const comments = JSON.parse(
      localStorage.getItem(`comments-${movieId}`) || "[]"
    );

    comments.forEach((comment) => {
      out += /*html*/ `
        <div class="comment-item">
          <img src="${
            comment.user.photoURL ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              comment.user.username
            )}`
          }" />
          <div>
            <div>
              <strong>${comment.user.username}</strong>
              <p>${comment.title}</p>
            </div>
           <p>${calculateElapsedTime(comment.createdAt)}</p>
          </div>
        </div> 
      `;
    });
    document.querySelector("#comments").innerHTML = out;
  };

  document.querySelector(".backdrop").classList.add("backdrop-hidden");

  renderComments();

  document.title = `Watch ${
    result.data.title || result.data.name
  } - MindX Cinema`;
})();

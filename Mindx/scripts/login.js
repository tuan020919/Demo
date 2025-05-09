// if already logged in, redirect to home page
if (localStorage.getItem("currentUser")) {
  location.href = "./index.html";
}

let form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!localStorage.getItem("users")) {
    alert("No user found");
  } else {
    let users = JSON.parse(localStorage.getItem("users"));

    let email = document.getElementById("email");
    let password = document.getElementById("password");

    let existingUser = users.find(
      (index) =>
        index.email === email.value.trim() &&
        index.password === password.value.trim()
    );

    if (existingUser) {
      localStorage.setItem("currentUser", JSON.stringify(existingUser));

      location.href = "/index.html";
    } else {
      alert("Email or password is incorrect");
    }
  }
});

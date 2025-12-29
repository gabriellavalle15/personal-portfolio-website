function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function renderFavorites() {
  const container = document.getElementById("favoritesContainer");
  const favorites = getFavorites();

  if (!favorites.length) {
    container.innerHTML = `<p class="message">No favorites yet 💔</p>`;
    return;
  }

  container.innerHTML = "";

  favorites.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <img class="recipe-image" src="${recipe.image}" alt="${recipe.label}" />
      <h3 class="recipe-title">${recipe.label}</h3>
      <p class="recipe-meta">${recipe.cuisineType?.join(", ") || ""}</p>

      <a class="recipe-link" href="${recipe.url}" target="_blank">View Recipe</a>

      <button class="remove-btn" data-index="${index}">
        Remove 💔
      </button>
    `;

    container.appendChild(card);
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", removeFavorite);
  });
}

function removeFavorite(e) {
  const index = e.target.dataset.index;
  const favorites = getFavorites();

  favorites.splice(index, 1);
  saveFavorites(favorites);

  renderFavorites();
}

renderFavorites();
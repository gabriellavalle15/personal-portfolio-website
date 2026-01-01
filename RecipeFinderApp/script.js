/*******************************
 *  CONFIG: EDAMAM CREDENTIALS
 *******************************/
const APP_ID = "e2e9cd56";
const APP_KEY = "8c497b89cf979fc14139f9743742d99a";
fetch(`http://localhost:3000/recipes?q=${ingredients}`)

/*******************************
 *  DOM ELEMENTS
 *******************************/
const ingredientsInput = document.getElementById("ingredients");
const dietSelect = document.getElementById("diet");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");

const detailModal = document.getElementById("detailModal");
const detailContent = document.getElementById("detailContent");
const detailCloseBtn = document.getElementById("detailCloseBtn");

const toggleViewBtn = document.getElementById("toggleViewBtn");
const togglePageBtn = document.getElementById("togglePageBtn");

/*******************************
 *  STATE
 *******************************/
let currentResults = [];
let isListView = false;
let showingFavorites = false;

/*******************************
 *  UTIL: DEBOUNCE
 *******************************/
function debounce(fn, delay = 500) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/*******************************
 *  UI HELPERS
 *******************************/
function clearResults() {
  resultsContainer.innerHTML = "";
}

function renderMessage(message) {
  clearResults();
  const div = document.createElement("div");
  div.className = "message";
  div.textContent = message;
  resultsContainer.appendChild(div);
}

function setLoading(isLoading) {
  clearResults();

  if (isLoading) {
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    resultsContainer.appendChild(spinner);
  }
}


/*******************************
 *  FETCH RECIPES
 *******************************/
async function fetchRecipes() {
  const ingredients = ingredientsInput.value.trim();

  if (!ingredients) {
    renderMessage("Please enter at least one ingredient.");
    return;
  }

  setLoading(true);


  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${ingredients}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.meals) {
      renderMessage("No recipes found. Try different ingredients.");
      return;
    }

    // Convert TheMealDB format → your app format
    currentResults = data.meals.map(meal => ({
      label: meal.strMeal,
      image: meal.strMealThumb,
      url: meal.strSource || meal.strYoutube || "#",
      ingredientLines: extractIngredients(meal),
      dietLabels: [],
      healthLabels: [],
      totalNutrients: {}
    }));

    renderResults(currentResults);
  } catch (error) {
    console.error(error);
    renderMessage("There was an error fetching recipes.");
  }
}

function extractIngredients(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push(`${ingredient} - ${measure}`);
    }
  }

  return ingredients;
}

/*******************************
 *  RENDER RESULTS
 *******************************/
function renderResults(recipes) {
  clearResults();

  recipes.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const ingredientList = recipe.ingredientLines
      .map(line => `<li>${line}</li>`)
      .join("");

    card.innerHTML = `
      <img class="recipe-image" src="${recipe.image}" alt="${recipe.label}" />
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.label}</h3>
        <p class="recipe-meta">
          ${recipe.cuisineType?.join(", ") || "Unknown cuisine"}
          • ${Math.round(recipe.calories)} calories
        </p>

        <ul class="recipe-ingredients">${ingredientList}</ul>

        <div class="recipe-actions">
          <a class="recipe-link" href="${recipe.url}" target="_blank">View Full Recipe</a>

          <button class="btn-favorite" data-index="${index}">
            <span class="heart"></span>
          </button>

          <button class="btn-details" data-index="${index}">Details</button>
        </div>
      </div>
    `;

    // ⭐ Mark favorites
    const isFav = getFavorites().some(
      fav => fav.label === recipe.label && fav.url === recipe.url
    );
    if (isFav) {
      card.querySelector(".btn-favorite").classList.add("active");
    }

    resultsContainer.appendChild(card);
  });

  // Attach listeners
  document.querySelectorAll(".btn-favorite").forEach(btn =>
    btn.addEventListener("click", handleSaveFavorite)
  );

  document.querySelectorAll(".btn-details").forEach(btn =>
    btn.addEventListener("click", handleShowDetails)
  );
}

/*******************************
 *  FAVORITES (localStorage)
 *******************************/
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function handleSaveFavorite(e) {
  const btn = e.target.closest(".btn-favorite");
  const index = btn.dataset.index;
  const recipe = currentResults[index];

  const favorites = getFavorites();

  const exists = favorites.some(
    fav => fav.label === recipe.label && fav.url ===recipe.url
  );

  if (exists) {
    const updated = favorites.filter(
      fav => !(fav.label === recipe.label && fav.url === recipe.url)
    );
    saveFavorites(updated);
    btn.classList.remove("active");
    return;
  }

  favorites.push(recipe);
  saveFavorites(favorites);
  btn.classList.add("active");
}

/*******************************
 *  FAVORITES PAGE TOGGLE
 *******************************/
togglePageBtn.addEventListener("click", () => {
  showingFavorites = !showingFavorites;

  if (showingFavorites) {
    togglePageBtn.textContent = "💖 Favorites";
    renderFavoritesInline();
  } else {
    togglePageBtn.textContent = "⭐ All Recipes";
    renderResults(currentResults);
  }
});

function renderFavoritesInline() {
  const favorites = getFavorites();

  if (!favorites.length) {
    renderMessage("No favorites yet 💔");
    return;
  }

  clearResults();

  favorites.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const ingredientList = recipe.ingredientLines
      .map(line => `<li>${line}</li>`)
      .join("");

    card.innerHTML = `
      <img class="recipe-image" src="${recipe.image}" alt="${recipe.label}" />
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.label}</h3>
        <p class="recipe-meta">${recipe.cuisineType?.join(", ") || ""}</p>

        <ul class="recipe-ingredients">${ingredientList}</ul>

        <div class="recipe-actions">
          <a class="recipe-link" href="${recipe.url}" target="_blank">View Recipe</a>

          <button class="btn-favorite active" data-index="${index}">
            <span class="heart"></span>
          </button>

          <button class="remove-btn" data-index="${index}">Remove 💔</button>
        </div>
      </div>
    `;

    resultsContainer.appendChild(card);
  });

  document.querySelectorAll(".remove-btn").forEach(btn =>
    btn.addEventListener("click", removeFavoriteInline)
  );
}

function removeFavoriteInline(e) {
  const index = e.target.dataset.index;
  const favorites = getFavorites();

  favorites.splice(index, 1);
  saveFavorites(favorites);

  renderFavoritesInline();
}

/*******************************
 *  DETAIL MODAL
 *******************************/
function handleShowDetails(e) {
  const index = e.target.dataset.index;
  const recipe = currentResults[index];
  if (!recipe) return;

  const nutrients = recipe.totalNutrients || {};
  const calories = Math.round(recipe.calories);
  const protein = nutrients.PROCNT ? Math.round(nutrients.PROCNT.quantity) : "N/A";
  const fat = nutrients.FAT ? Math.round(nutrients.FAT.quantity) : "N/A";
  const carbs = nutrients.CHOCDF ? Math.round(nutrients.CHOCDF.quantity) : "N/A";

  detailContent.innerHTML = `
    <h2>${recipe.label}</h2>
    <img src="${recipe.image}" class="detail-image" />

    <p><strong>Source:</strong> ${recipe.source}</p>
    <p><strong>Calories:</strong> ${calories}</p>
    <p><strong>Macros:</strong> Protein ${protein}g • Fat ${fat}g • Carbs ${carbs}g</p>

    <h3>Ingredients</h3>
    <ul>${recipe.ingredientLines.map(i => `<li>${i}</li>`).join("")}</ul>

    <div class="detail-actions">
      <a href="${recipe.url}" target="_blank">View Full Instructions</a>
      <button id="shareBtn">Share</button>
    </div>
  `;

  detailModal.classList.add("open");

  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => handleShare(recipe));
  }
}

function handleShare(recipe) {
  if (navigator.share) {
    navigator.share({
      title: recipe.label,
      text: "Check out this recipe!",
      url: recipe.url
    });
  } else {
    alert("Sharing not supported on this browser.");
  }
}

function closeDetailModal() {
  detailModal.classList.remove("open");
}

detailCloseBtn?.addEventListener("click", closeDetailModal);
detailModal?.addEventListener("click", e => {
  if (e.target === detailModal) closeDetailModal();
});

/*******************************
 *  GRID / LIST VIEW TOGGLE
 *******************************/
toggleViewBtn.addEventListener("click", () => {
  isListView = !isListView;

  if (isListView) {
    resultsContainer.classList.add("list-view");
    toggleViewBtn.textContent = "📄 List View";
  } else {
    resultsContainer.classList.remove("list-view");
    toggleViewBtn.textContent = "🔲 Grid View";
  }
});

/*******************************
 *  INPUT EVENTS
 *******************************/
searchBtn?.addEventListener("click", fetchRecipes);

const debouncedFetch = debounce(fetchRecipes, 800);
ingredientsInput?.addEventListener("input", () => {
  if (ingredientsInput.value.trim().length >= 3) {
    debouncedFetch();
  }
});

const randomBtn = document.getElementById("randomBtn");

randomBtn.addEventListener("click", fetchRandomRecipe);

async function fetchRandomRecipe() {
  setLoading(true);

  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const data = await res.json();

    if (!data.meals) {
      renderMessage("Could not load a random recipe.");
      return;
    }

    const meal = data.meals[0];

    currentResults = [
      {
        label: meal.strMeal,
        image: meal.strMealThumb,
        url: meal.strSource || meal.strYoutube || "#",
        cuisineType: [meal.strArea],
        calories: 0,
        ingredientLines: extractIngredients(meal),
        dietLabels: [],
        healthLabels: [],
        totalNutrients: {}
      }
    ];

    renderResults(currentResults);
  } catch (error) {
    console.error(error);
    renderMessage("Error loading random recipe.");
  }
}
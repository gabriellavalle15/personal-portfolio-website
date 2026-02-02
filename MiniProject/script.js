let buttons = 5;
let colors = ["Pink", "Purple", "Gold", "Blue", "Red", "Green", "Orange", "Silver"];
let project = {
    name: "My Formal Dress",
    sparkleLevel: "High",
};

function startCrafting() {
    let message = "";

    for (let i = 1; i <= buttons; i++) {
        message += `<span class="step">Sewing Button! ${i}</span><br>`;
    }

    if (project.sparkleLevel === "High") {
        message += "Adding sparkles...<br>";
    } else {
        message += "Needs more sparkles<br>";
    }
    for (let i = 0; i < 6; i++) {
        makeSparkle();
    }
    document.getElementById("output").innerHTML = message;
}

function showColors() {
    let message = "Color palette:<br>";

    for (let i = 0; i < colors.length; i++) {
        const colorName = colors[i].toLowerCase();
        message += `<span class="color ${colorName}">${colors[i]}</span><br>`;
    }

    document.getElementById("output").innerHTML = message;
}


function makeSparkle(){
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.textContent = "✨";

    sparkle.style.left = Math.random() * window.innerWidth + "px";
    sparkle.style.top = Math.random() * window.innerHeight + "px";

    document.body.appendChild(sparkle);

    setTimeout(() => {
        sparkle.remove();
    }, 1500);
}

const themeBtn = document.getElementById("themeBtn");

updateThemeButtonText

function updateThemeButtonText() {
    const isDark = document.body.classList.contains("dark");
    themeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    updateThemeButtonText();
});

document.getElementById("startBtn").addEventListener("click", startCrafting);
document.getElementById("colorBtn").addEventListener("click", showColors);
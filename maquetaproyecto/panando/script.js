document.addEventListener("DOMContentLoaded", () => {
  // Botón "Ver reseña completa" del hero hace scroll a la sección de reseñas
  const heroBtn = document.querySelector(".btn-primary");
  const sectionResenas = document.querySelector("#resenas");

  if (heroBtn && sectionResenas) {
    heroBtn.addEventListener("click", () => {
      sectionResenas.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Botones de filtro
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".review-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      cards.forEach((card) => {
        const tipo = card.dataset.tipo;
        if (filter === "todos" || tipo === filter) {
          card.style.display = "grid";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Botones "Leer más"
  const leerMasBtns = document.querySelectorAll(".btn-leer-mas");
  leerMasBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".review-card");
      const extra = card.querySelector(".review-extra");
      extra.classList.toggle("show");
      btn.textContent = extra.classList.contains("show")
        ? "Leer menos"
        : "Leer más";
    });
  });

  // Botón para volver arriba
  const btnSubir = document.getElementById("btn-subir");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 350) {
      btnSubir.classList.add("show");
    } else {
      btnSubir.classList.remove("show");
    }
  });

  btnSubir.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

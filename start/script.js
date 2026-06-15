// Mini-libreria — Settimana VII Giorno I
//
// Devi fare 4 cose:
// 1. Definire una classe Libro (titolo, autore, anno, letto)
// 2. Definire una classe LibroDigitale che estende Libro (aggiunge formato, dimensioneMb)
// 3. Aggiungere un listener al form che crea una nuova istanza e la aggiunge all'array
// 4. Renderizzare la lista nel <ul id="lista-libri"> via innerHTML
//
// Bonus: bottone "Segna come letto" su ogni elemento, gestito con event delegation.

// === Classi ===

class Libro {
  static contatore = 0;
  constructor(titolo, autore, anno, categoria) {
    this.id = Libro.contatore++;
    this.titolo = titolo;
    this.autore = autore;
    this.anno = anno;
    this.categoria = categoria;
    this.letto = false;
  }
}

class LibroDigitale extends Libro {
  constructor(titolo, autore, anno, categoria) {
    super(titolo, autore, anno, categoria);

    this.dimensioneMb =
      this.categoria === "Digitale"
        ? (Math.random() * 10).toFixed(2)
        : undefined;
  }
}

const form = document.querySelector(".form-form");

const libri = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const titolo = document.querySelector("#titoloInput").value.trim();
  const autore = document.querySelector("#autoreInput").value.trim();
  const anno = document.querySelector("#annoInput").value.trim();
  const categoria = document.querySelector("#Categoria").value;

  if (!titolo || !autore || !anno) {
    alert("Compila tutti i campi prima di aggiungere un libro.");
    return;
  }

  if (categoria === "Digitale") {
    libri.push(new LibroDigitale(titolo, autore, anno, categoria));
  } else {
    libri.push(new Libro(titolo, autore, anno, categoria));
  }

  form.reset();
  renderLista();
});

// === Render ===

function renderLista() {
  document.querySelector("#contatore-libri").textContent = libri.length;
  const ul = document.querySelector("#lista-libri");
  ul.innerHTML = libri
    .map((libro) => {
      const badgeLabel =
        libro.dimensioneMb
          ? `${libro.categoria.toLowerCase()} (${libro.dimensioneMb} MB)`
          : libro.categoria.toLowerCase();

      const azione = libro.letto
        ? `<span class="letto-label">✓ letto</span>`
        : `<button class="btn-segna" data-id="${libro.id}">Segna come letto</button>`;

      const catClass = `cat-${libro.categoria.toLowerCase()}`;

      return `
      <li data-id="${libro.id}" class="${libro.letto ? "letto" : ""} ${catClass}">
        <div class="libro-info">
          <span class="libro-titolo">
            ${libro.titolo}
            <span class="badge-categoria">${badgeLabel}</span>
          </span>
          <span class="libro-sottotitolo">${libro.autore} — ${libro.anno}</span>
        </div>
        ${azione}
      </li>`;
    })
    .join("");
}

// === Event delegation ===

document.querySelector("#lista-libri").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-segna");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const libro = libri.find((l) => l.id === id);
  if (libro) {
    libro.letto = true;
    renderLista();
  }
});

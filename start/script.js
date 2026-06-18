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

const STORAGE_KEY = "libri";

function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}

function caricaLibri() {
  const dati = localStorage.getItem(STORAGE_KEY);
  if (dati === null) {
    return [];
  }

  return JSON.parse(dati).map((d) => {
    const l =
      d.dimensioneMb !== undefined
        ? new LibroDigitale(d.titolo, d.autore, d.anno, d.categoria)
        : new Libro(d.titolo, d.autore, d.anno, d.categoria);
    l.id = d.id;
    l.letto = d.letto;
    return l;
  });
}

let libri = caricaLibri();

// === Render ===

function renderLista() {
  document.querySelector("#contatore-libri").textContent = libri.length;
  const ul = document.querySelector("#lista-libri");
  ul.innerHTML = libri
    .map((libro) => {
      const badgeLabel = libro.dimensioneMb
        ? `${libro.categoria.toLowerCase()} (${libro.dimensioneMb} MB)`
        : libro.categoria.toLowerCase();

      const azione = libro.letto
        ? `<span class="letto-label">✓ letto</span>
           <button class="btn-rimuovi" data-azione="rimuovi" data-id="${libro.id}">Rimuovi</button>`
        : `<button class="btn-segna" data-azione="leggi" data-id="${libro.id}">Segna come letto</button>
           <button class="btn-rimuovi" data-azione="rimuovi" data-id="${libro.id}">Rimuovi</button>`;

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
  const bottone = e.target.closest("[data-azione]");
  if (!bottone) return;
  const id = Number(bottone.dataset.id);
  const azione = bottone.dataset.azione;

  if (azione === "leggi") {
    const libro = libri.find((l) => l.id === id);
    if (libro) libro.letto = true;
  } else if (azione === "rimuovi") {
    libri = libri.filter((l) => l.id !== id);
  }

  salvaLibri();
  renderLista();
});

document.getElementById("svuota-tutto").addEventListener("click", () => {
  libri = [];
  localStorage.removeItem(STORAGE_KEY);
  renderLista();
});

function mostraSpinner() {
  document.getElementById("spinner").hidden = false;
  document.getElementById("errore").hidden = true;
}

function nascondiSpinner() {
  document.getElementById("spinner").hidden = true;
}

function mostraErrore(msg) {
  document.getElementById("errore").textContent = msg;
  document.getElementById("errore").hidden = false;
}

async function cerca(query) {
  mostraSpinner();
  const filtro = document.getElementById("filtro-cerca").value;
  const url =
    "https://openlibrary.org/search.json?" +
    filtro +
    "=" +
    encodeURIComponent(query) +
    "&limit=10";

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error("Errore HTTP" + r.status);
    const data = await r.json();
    renderRisultati(data.docs);
  } catch (err) {
    mostraErrore("Impossibile completare la ricerca" + err.message);
  } finally {
    nascondiSpinner();
  }
}

function renderRisultati(docs) {
  const ul = document.getElementById("risultati");

  if (docs.length === 0) {
    ul.innerHTML = "<li>Nessun risultato.</li>";
    return;
  }
  ul.innerHTML = docs
    .map((d) => {
      const titolo = d.title;
      const autore =
        d.author_name && d.author_name[0]
          ? d.author_name[0]
          : "Autore sconosciuto";
      const anno = d.first_publish_year ? d.first_publish_year : "?";
      return `
  <li>
    <div class="info">
      <span class="titolo">${titolo}</span>
      <div class="meta">${autore} - ${anno}</div>
    </div>
    <button data-titolo="${titolo}" data-autore="${autore}" data-anno="${anno}">
      Aggiungi
    </button>
  </li>`;
    })
    .join("");
}

let timeoutId;

document.getElementById("cerca").addEventListener("input", (e) => {
  const query = e.target.value.trim();

  if (query.length < 3) {
    document.getElementById("risultati").innerHTML = "";
    return;
  }

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => cerca(query), 400);
});

document.getElementById("risultati").addEventListener("click", (e) => {
  const bottone = e.target.closest("button[data-titolo]");
  if (!bottone) return;

  const titolo = bottone.dataset.titolo;
  const autore = bottone.dataset.autore;
  const anno = parseInt(bottone.dataset.anno);

  libri.push(new Libro(titolo, autore, anno, "Cartaceo"));
  salvaLibri();
  renderLista();

  bottone.textContent = "✓ Aggiunto";
  bottone.setAttribute("disabled", "");
});

function getToken() {
  return localStorage.getItem("auth.token");
}

function getUtente() {
  try {
    return JSON.parse(localStorage.getItem("auth.user"));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("auth.token");
  localStorage.removeItem("auth.user");
  document.getElementById("profilo-section").hidden = true;
}

async function login(username, password) {
  const r = await fetch("https://dummyjson.com/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error("Credenziali non valide");

  const dati = await r.json();
  localStorage.setItem("auth.token", dati.accessToken);
  localStorage.setItem("auth.user", JSON.stringify(dati));
  return dati;
}

async function caricaProfilo() {
  const token = getToken();
  if (!token) return null;
  const r = await fetch("https://dummyjson.com/auth/me", {
    headers: { Authorization: "Bearer " + token },
  });

  if (r.status === 401) {
    logout();
    return null;
  }
  return await r.json();
}

function renderAuthBox() {
  const utente = getUtente();
  const box = document.getElementById("auth-box");

  if (utente) {
    box.innerHTML = `
      <span class="saluto">Ciao ${utente.firstName}</span>
      <button class="btn-logout" id="btn-logout">Esci</button>
    `;
    document.getElementById("btn-logout").addEventListener("click", () => {
      logout();
      renderAuthBox();
    });
    return;
  }
  box.innerHTML = ` <form id="form-login">
        <input id="login-username" type="text" placeholder="Username" value="emilys" />
        <input id="login-password" type="password" placeholder="Password" value="emilyspass" />
        <button type="submit">Login</button>
      </form>
    `;
  document
    .getElementById("form-login")
    .addEventListener("submit", gestisciLogin);
}

async function gestisciLogin(e) {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    await login(username, password);
    renderAuthBox();
    await mostraProfilo();
  } catch (err) {
    alert(err.message);
  }
}

async function mostraProfilo() {
  if (!getToken()) return;

  try {
    const profilo = await caricaProfilo();
    document.getElementById("profilo").innerHTML = `
      <img src="${profilo.image}" alt="avatar" />
      <div class="info">
        <p><strong>${profilo.firstName} ${profilo.lastName}</strong></p>
        <p>@${profilo.username} - ${profilo.email}</p>
      </div>
    `;
    document.getElementById("profilo-section").removeAttribute("hidden");
  } catch (err) {
    console.log(err.message);
  }
}

async function avvio() {
  renderLista();
  renderAuthBox();
  await mostraProfilo();
}

avvio();

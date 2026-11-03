// ========== 1. TEXTO QUE SE ESCRIBE SOLO ==========
const frases = ["de buen corazón 💚", "alegre 😄", "amigable 🤝", "infalible 🛡️", "confiable 🔒"];
const typed = document.getElementById("typed");
let fraseIdx = 0, letraIdx = 0, borrando = false;

function escribir() {
  const frase = frases[fraseIdx];
  typed.textContent = frase.substring(0, letraIdx);
  if (!borrando && letraIdx < frase.length) {
    letraIdx++;
    setTimeout(escribir, 100);
  } else if (!borrando) {
    borrando = true;
    setTimeout(escribir, 1400);
  } else if (letraIdx > 0) {
    letraIdx--;
    setTimeout(escribir, 50);
  } else {
    borrando = false;
    fraseIdx = (fraseIdx + 1) % frases.length;
    setTimeout(escribir, 300);
  }
}
escribir();

// ========== 2. ANIMACIÓN AL HACER SCROLL (una transición distinta por sección) ==========
const secciones = document.querySelectorAll(".seccion");

function animarMedidores(seccion) {
  seccion.querySelectorAll(".skill").forEach((s, i) => {
    const nivel = Number(s.dataset.nivel);
    const aro = s.querySelector(".g-valor");
    const num = s.querySelector(".g-num");
    aro.style.strokeDashoffset = 327 * (1 - nivel / 100);
    const inicio = performance.now() + 400 + i * 180, dur = 2200;
    (function contar(ahora) {
      const t = Math.max(0, Math.min(1, (ahora - inicio) / dur));
      num.textContent = Math.round((1 - Math.pow(1 - t, 3)) * nivel);
      if (t < 1) requestAnimationFrame(contar); else s.classList.add("listo");
    })(performance.now());
  });
}

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting && !e.target.classList.contains("visible")) {
      e.target.classList.add("visible");
      if (e.target.id === "habilidades") animarMedidores(e.target);
    }
  });
}, { threshold: 0.2 });

// ========== 2b. CORTINA DE ENTRADA ==========
const intro = document.getElementById("intro");
setTimeout(() => {
  intro.classList.add("abierto");
  document.body.classList.remove("cargando");
  secciones.forEach((s) => observador.observe(s));
  setTimeout(() => intro.remove(), 1400);
}, 1700);

// ========== 2c. FORMAS FLOTANTES EN CADA SECCIÓN ==========
const rnd = (a, b) => a + Math.random() * (b - a);
secciones.forEach((sec) => {
  if (sec.id === "inicio") return;
  ["d-aro", "d-cruz", "d-rombo"].forEach((clase) => {
    const d = document.createElement("span");
    d.className = "deco " + clase;
    d.style.left = rnd(3, 92) + "%";
    d.style.top = rnd(8, 85) + "%";
    d.style.animationDuration = rnd(7, 15) + "s";
    d.style.animationDelay = -rnd(0, 8) + "s";
    sec.appendChild(d);
  });
});

// ========== 3. BARRA DE PROGRESO + MENÚ ACTIVO ==========
const barra = document.getElementById("barraProgreso");
const enlaces = document.querySelectorAll(".menu ul a");

window.addEventListener("scroll", () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.width = (window.scrollY / total) * 100 + "%";

  let actual = "";
  secciones.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 250) actual = sec.id;
  });
  enlaces.forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === "#" + actual));
});

// ========== 4. LUZ QUE SIGUE AL CURSOR ==========
const glow = document.getElementById("glowCursor");
document.addEventListener("mousemove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

// ========== 5. MODOS DE COLOR (mixto / rojo / verde) ==========
const paletas = {
  mixto: ["255,46,77", "34,255,156"],
  rojo: ["255,23,68", "255,107,129"],
  verde: ["0,230,118", "105,240,174"],
};
let paletaActual = paletas.mixto;

const btnModo = document.getElementById("btnModo");
const modos = [
  { id: "mixto", texto: "🎨 Mixto" },
  { id: "rojo", texto: "❤️ Rojo" },
  { id: "verde", texto: "💚 Verde" },
];
let modoIdx = 0;
btnModo.addEventListener("click", () => {
  modoIdx = (modoIdx + 1) % modos.length;
  const modo = modos[modoIdx];
  document.body.dataset.mode = modo.id;
  btnModo.textContent = modo.texto;
  paletaActual = paletas[modo.id];
  actualizarTinte();
});

// ========== 6. DATO CURIOSO ==========
const btnDato = document.getElementById("btnDato");
const dato = document.getElementById("datoSecreto");
btnDato.addEventListener("click", () => {
  dato.classList.toggle("abierto");
  btnDato.textContent = dato.classList.contains("abierto") ? "Ocultar 🙈" : "¡Descúbrelo! 🎁";
  if (dato.classList.contains("abierto")) lanzarConfeti();
});

// ========== 7. PARTÍCULAS DE FONDO ==========
const canvas = document.getElementById("particulas");
const ctx = canvas.getContext("2d");
let particulas = [];

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

class Particula {
  constructor(confeti = false, x, y) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? Math.random() * canvas.height;
    this.r = confeti ? Math.random() * 4 + 2 : Math.random() * 2 + 0.5;
    this.vx = (Math.random() - 0.5) * (confeti ? 8 : 0.5);
    this.vy = confeti ? -Math.random() * 9 - 2 : (Math.random() - 0.5) * 0.5;
    this.tono = Math.random() > 0.5 ? 0 : 1;
    this.vida = confeti ? 100 : Infinity;
    this.confeti = confeti;
  }
  get color() { return paletaActual[this.tono]; }
  mover() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.confeti) { this.vy += 0.25; this.vida--; }
    else {
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
  }
  dibujar() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.confeti ? this.vida / 100 : 0.8})`;
    ctx.fill();
  }
}

for (let i = 0; i < 70; i++) particulas.push(new Particula());

function lanzarConfeti() {
  const rect = btnDato.getBoundingClientRect();
  for (let i = 0; i < 60; i++) {
    particulas.push(new Particula(true, rect.left + rect.width / 2, rect.top + rect.height / 2));
  }
}

function animar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particulas = particulas.filter((p) => p.vida > 0);
  particulas.forEach((p) => { p.mover(); p.dibujar(); });

  const fijas = particulas.filter((p) => !p.confeti);
  for (let i = 0; i < fijas.length; i++) {
    for (let j = i + 1; j < fijas.length; j++) {
      const d = Math.hypot(fijas[i].x - fijas[j].x, fijas[i].y - fijas[j].y);
      if (d < 120) {
        ctx.beginPath();
        ctx.moveTo(fijas[i].x, fijas[i].y);
        ctx.lineTo(fijas[j].x, fijas[j].y);
        ctx.strokeStyle = `rgba(${fijas[i].color},${0.15 * (1 - d / 120)})`;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animar);
}
animar();

// ========== 8. FONDO QUE SE DEGRADA SEGÚN EL SCROLL ==========
function actualizarTinte() {
  const modo = document.body.dataset.mode;
  let h;
  if (modo === "rojo") h = 350;
  else if (modo === "verde") h = 150;
  else {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const p = total > 0 ? window.scrollY / total : 0;
    h = (350 + p * 160) % 360;
  }
  document.documentElement.style.setProperty("--tinte", `hsl(${h}, 100%, 55%)`);
}
window.addEventListener("scroll", actualizarTinte);
actualizarTinte();

// ========== 9. LLUVIA DE EMOJIS ==========
const lluvia = document.getElementById("lluvia");
const emojisPrincipales = ["🥹", "🫂", "❤️", "💚"];
const emojisOtros = ["😄", "✨", "🤝", "🛡️", "🔥", "🌟", "💫", "🍀", "🎸", "🎵", "🍝", "🐱"];

function soltarEmoji() {
  if (document.hidden || lluvia.childElementCount > 55) return;
  const lista = Math.random() < 0.7 ? emojisPrincipales : emojisOtros;
  const e = document.createElement("span");
  e.className = "gota-emoji";
  e.textContent = lista[Math.floor(Math.random() * lista.length)];
  e.style.left = Math.random() * 100 + "vw";
  e.style.fontSize = 16 + Math.random() * 24 + "px";
  e.style.animationDuration = 6 + Math.random() * 6 + "s";
  e.style.setProperty("--giro", (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360) + "deg");
  lluvia.appendChild(e);
  e.addEventListener("animationend", () => e.remove());
}
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!sinMovimiento) setInterval(soltarEmoji, 280);

// ========== 10. MÚSICA DE FONDO (It's My Life) ==========
const musica = document.getElementById("musica");
const btnMusica = document.getElementById("btnMusica");
const aviso = document.getElementById("avisoMusica");
const selectorAudio = document.getElementById("selectorAudio");
musica.volume = 0.45;

// La página prueba estos nombres de archivo, en orden:
const candidatas = [
  "audio/its-my-life.mp3",
  "audio/its my life.mp3",
  "audio/It's My Life.mp3",
  "audio/its-my-life.m4a",
  "audio/its-my-life.ogg",
  "audio/its-my-life.wav",
];
let candIdx = 0, sinAudio = false, pausadoPorUsuario = false;

function mostrarAviso(texto, segundos = 0) {
  aviso.textContent = texto;
  aviso.classList.add("visible");
  if (segundos) setTimeout(() => aviso.classList.remove("visible"), segundos * 1000);
}
function ocultarAviso() { aviso.classList.remove("visible", "clicable"); }

function cargarSiguiente() {
  if (candIdx >= candidatas.length) {
    sinAudio = true;
    console.warn("No se encontró el audio. Rutas probadas:", candidatas);
    aviso.classList.add("clicable");
    mostrarAviso("⚠️ No encuentro la canción en audio/its-my-life.mp3 · toca aquí para elegir el archivo (solo prueba)", 20);
    return;
  }
  musica.src = candidatas[candIdx++];
  musica.load();
}
musica.addEventListener("error", cargarSiguiente);
cargarSiguiente();

// Plan B para probar: elegir el MP3 desde tu computadora
aviso.addEventListener("click", () => { if (sinAudio) selectorAudio.click(); });
selectorAudio.addEventListener("change", () => {
  const archivo = selectorAudio.files[0];
  if (!archivo) return;
  sinAudio = false;
  musica.src = URL.createObjectURL(archivo);
  musica.load();
  ocultarAviso();
  sonar();
});

async function sonar() {
  if (sinAudio) { aviso.classList.add("clicable"); mostrarAviso("⚠️ No encuentro la canción en audio/its-my-life.mp3 · toca aquí para elegir el archivo (solo prueba)", 15); return; }
  try {
    await musica.play();
    btnMusica.classList.add("sonando");
    btnMusica.textContent = "🔊 Música";
    ocultarAviso();
  } catch (err) {
    if (!sinAudio) mostrarAviso("🎵 Toca cualquier parte de la página para activar la música", 10);
  }
}
function pararMusica() {
  musica.pause();
  btnMusica.classList.remove("sonando");
  btnMusica.textContent = "🔇 Música";
}
btnMusica.addEventListener("click", () => {
  if (musica.paused) { pausadoPorUsuario = false; sonar(); }
  else { pausadoPorUsuario = true; pararMusica(); }
});

const eventosGesto = ["pointerdown", "click", "keydown", "touchstart"];
function primerGesto(e) {
  if (e.target.closest && (e.target.closest("#btnMusica") || e.target.closest("#avisoMusica"))) return;
  if (!pausadoPorUsuario) sonar();
  eventosGesto.forEach((ev) => document.removeEventListener(ev, primerGesto));
}
eventosGesto.forEach((ev) => document.addEventListener(ev, primerGesto));

setTimeout(() => {
  if (musica.paused && !sinAudio) mostrarAviso("🎵 Toca cualquier parte de la página para activar la música", 10);
}, 3200);

// =====================================================================
// ========== 11. ESCENAS DE LOS BOTONES (hovers en grande) ============
// =====================================================================
const escena = document.getElementById("escena");
const W = () => window.innerWidth;
const H = () => window.innerHeight;
let tok = 0, uid = 0;                      // tok: identifica la escena actual
const U = () => "u" + (++uid);             // ids únicos para los degradados SVG
const esperar = (ms, fn) => { const t = tok; setTimeout(() => { if (t === tok) fn(); }, ms); };
const acc1 = () => getComputedStyle(document.body).getPropertyValue("--acento1").trim() || "#ff2e4d";
const acc2 = () => getComputedStyle(document.body).getPropertyValue("--acento2").trim() || "#22ff9c";

// translate + rotate + scale, centrado en el punto
const T = (x = 0, y = 0, r = 0, s = 1) => {
  const sc = Array.isArray(s) ? s.join(",") : s;
  return `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${r}deg) scale(${sc})`;
};

function crear(css = {}, html = "", clase = "fx") {
  const e = document.createElement("div");
  if (escena.childElementCount > 300) return e;   // límite de seguridad
  e.className = clase;
  Object.assign(e.style, css);
  e.innerHTML = html;
  escena.appendChild(e);
  return e;
}
function mover(e, frames, opts = {}) {
  if (frames[0].opacity === undefined) frames[0].opacity = 1;
  const a = e.animate(frames, { duration: 1000, easing: "ease-out", fill: "forwards", ...opts });
  a.onfinish = () => e.remove();
  return a;
}
// Al empezar una escena nueva, la anterior se desvanece (así no se satura)
function limpiarEscena() {
  tok++;
  [...escena.children].forEach((e) => {
    const o = getComputedStyle(e).opacity;
    e.animate([{ opacity: o }, { opacity: 0 }], { duration: 220, fill: "forwards" }).onfinish = () => e.remove();
  });
}
function figura(svg, w, h, x = 0, y = 0, extra = {}) {            // ilustración con sombra
  return crear({ left: x + "px", top: y + "px", width: w + "px", height: h + "px", ...extra }, svg, "fx fig");
}
function pieza(svg, w, h, extra = {}) {                           // partícula sin sombra
  return crear({ left: "0px", top: "0px", width: w + "px", height: h + "px", transform: "translate(-50%,-50%)", ...extra }, svg, "fx");
}
function emoji(ch, x, y, size, extra = {}) {
  return crear({ left: x + "px", top: y + "px", fontSize: size + "px", ...extra }, ch, "fx fx-emoji");
}
function interp(ruta, t) {
  const n = ruta.length - 1, f = Math.min(t, 0.9999) * n, i = Math.floor(f), u = f - i;
  const a = ruta[i], b = ruta[i + 1];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

// --- Efectos reutilizables ---
function mancha(x, y, tam, color, blur = 8) {
  return crear({ left: x + "px", top: y + "px", width: tam + "px", height: tam + "px", borderRadius: "50%",
    background: `radial-gradient(circle at 35% 30%, ${color}, transparent 70%)`, filter: `blur(${blur}px)`, transform: "translate(-50%,-50%)" });
}
function humo(x, y, o = {}) {
  const { color = "rgba(220,220,230,.8)", tam = 60, dx = 0, dy = -120, dur = 1600, delay = 0, crece = 3 } = o;
  const e = mancha(x, y, tam, color, 10);
  mover(e, [
    { opacity: .85, transform: "translate(-50%,-50%) scale(.4)" },
    { opacity: 0, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${crece})` },
  ], { duration: dur, delay });
}
function onda(x, y, tam = 320, color = "var(--acento2)", delay = 0, dur = 1000) {
  const e = crear({ left: x + "px", top: y + "px", width: "10px", height: "10px", borderRadius: "50%",
    border: `3px solid ${color}`, boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}`, transform: "translate(-50%,-50%)" });
  mover(e, [{ width: "10px", height: "10px", opacity: .95 }, { width: tam + "px", height: tam + "px", opacity: 0 }],
    { duration: dur, delay, easing: "cubic-bezier(.1,.7,.3,1)" });
}
function destello(color = "255,255,255", op = .5, dur = 500) {
  const e = crear({ left: "0px", top: "0px", width: "100vw", height: "100vh",
    background: `radial-gradient(circle at 50% 40%, rgba(${color},${op}), transparent 72%)` });
  mover(e, [{ opacity: 1 }, { opacity: 0 }], { duration: dur });
}
function sacudir(px = 8, dur = 500) {
  const m = document.getElementById("contenido");
  const fr = [];
  for (let i = 0; i <= 10; i++) fr.push({ transform: i === 10 ? "translate(0,0)" : `translate(${rnd(-px, px)}px, ${rnd(-px, px)}px)` });
  m.animate(fr, { duration: dur, easing: "linear" });
}
// Chorro de partículas con gravedad (gotas brillantes, confeti, dibujos SVG o letras)
function chorro(x, y, n, o = {}) {
  const { dibujo = null, chars = null, txt = null, colores = ["#8fdcff"], tam = [8, 16], vel = [250, 600], ang = [-120, -60], grav = 800, dur = 1500, delay = 0, rot = 360, rect = false } = o;
  for (let i = 0; i < n; i++) {
    const a = rnd(ang[0], ang[1]) * Math.PI / 180, v = rnd(vel[0], vel[1]);
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v, s = rnd(tam[0], tam[1]), r = rnd(-rot, rot);
    const col = colores[Math.floor(Math.random() * colores.length)];
    let e;
    if (dibujo) e = pieza(dibujo(), s, s);
    else if (chars) {
      e = emoji(chars[Math.floor(Math.random() * chars.length)], 0, 0, s);
      if (txt) { e.style.color = txt; e.style.textShadow = `0 0 12px ${txt}`; e.style.filter = "none"; }
    } else {
      e = pieza("", s, rect ? s * .55 : s, { borderRadius: rect ? "2px" : "50%",
        background: rect ? col : `radial-gradient(circle at 30% 30%, #fff, ${col} 60%)`, boxShadow: rect ? "none" : `0 0 ${s}px ${col}` });
    }
    const frames = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, ts = t * dur / 1000;
      frames.push({ offset: t, opacity: t > .75 ? Math.max(0, 1 - (t - .75) * 4) : 1,
        transform: T(x + vx * ts, y + vy * ts + .5 * grav * ts * ts, r * t, 1 - t * .35) });
    }
    mover(e, frames, { duration: dur, delay: delay + rnd(0, 120), easing: "linear" });
  }
}
// Un objeto que recorre una ruta (con estela opcional). Las ilustraciones miran a la derecha.
function volar(el, ruta, o = {}) {
  const { dur = 2400, mira = 1, base = 0, alCamino = null, cada = 70, aparecer = false, desvanecer = false } = o;
  const n = ruta.length, t = tok;
  const dirX = Math.sign(ruta[n - 1][0] - ruta[0][0]) || 1;
  const flip = base ? 1 : dirX * mira;
  const frames = ruta.map((p, i) => {
    const a = ruta[Math.max(i - 1, 0)], b = ruta[Math.min(i + 1, n - 1)];
    const tilt = Math.atan2(b[1] - a[1], Math.abs(b[0] - a[0]) + 1) * 57.3 * dirX * .7;
    const s = p[2] ?? 1;
    return { offset: i / (n - 1), opacity: 1, transform: T(p[0], p[1], base + tilt, [flip * s, s]) };
  });
  if (aparecer) frames[0].opacity = 0;
  if (desvanecer) frames[n - 1].opacity = 0;
  mover(el, frames, { duration: dur, easing: "linear" });
  if (alCamino) {
    const t0 = performance.now();
    const id = setInterval(() => {
      const k = (performance.now() - t0) / dur;
      if (k >= 1 || t !== tok) return clearInterval(id);
      const [x, y] = interp(ruta, k);
      alCamino(x, y, k);
    }, cada);
  }
  return el;
}

// =====================  ILUSTRACIONES (SVG con gradientes)  =====================
const dib = {
  cohete: (u) => `<svg viewBox="0 0 220 90"><defs>
<linearGradient id="cb${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d5dbe5"/><stop offset="1" stop-color="#8590a1"/></linearGradient>
<linearGradient id="cr${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a73"/><stop offset="1" stop-color="#a30d26"/></linearGradient>
<radialGradient id="cv${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#d6f6ff"/><stop offset="1" stop-color="#1b6a8a"/></radialGradient>
<linearGradient id="fl${u}" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff6c2"/><stop offset=".35" stop-color="#ffb02e"/><stop offset="1" stop-color="#ff3d00" stop-opacity="0"/></linearGradient>
</defs>
<path class="llama" d="M54 45 C24 28 -6 36 -44 45 C-6 54 24 62 54 45Z" fill="url(#fl${u})"/>
<path d="M78 24 L44 4 L42 26 Z" fill="url(#cr${u})"/><path d="M78 66 L44 86 L42 64 Z" fill="url(#cr${u})"/>
<path d="M54 22 H140 C176 22 204 37 214 45 C204 53 176 68 140 68 H54 Q46 45 54 22Z" fill="url(#cb${u})" stroke="#7b8594" stroke-width="1.5"/>
<path d="M172 28 C190 32 205 39 214 45 C205 51 190 58 172 62 Z" fill="url(#cr${u})"/>
<rect x="100" y="22" width="12" height="46" fill="url(#cr${u})"/>
<circle cx="140" cy="45" r="13" fill="url(#cv${u})" stroke="#6f7a89" stroke-width="3"/>
<ellipse cx="136" cy="40" rx="4.5" ry="3" fill="#fff" opacity=".75"/>
<path d="M60 28 H168" stroke="#fff" stroke-opacity=".6" stroke-width="3"/></svg>`,

  voley: (u) => `<svg viewBox="0 0 100 100"><defs>
<radialGradient id="vb${u}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fffbe6"/><stop offset=".6" stop-color="#f3e7ae"/><stop offset="1" stop-color="#b9a24d"/></radialGradient>
<radialGradient id="vs${u}" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
<clipPath id="vc${u}"><circle cx="50" cy="50" r="47"/></clipPath></defs>
<g clip-path="url(#vc${u})"><rect width="100" height="100" fill="url(#vb${u})"/>
<path d="M-10 28 Q50 72 110 22" stroke="#2f6fe0" stroke-width="15" fill="none"/>
<path d="M-10 82 Q50 40 110 86" stroke="#2f6fe0" stroke-width="15" fill="none"/>
<g stroke="#8d7a2a" stroke-width="1.2" fill="none"><path d="M-10 21 Q50 65 110 15"/><path d="M-10 35 Q50 79 110 29"/><path d="M-10 75 Q50 33 110 79"/><path d="M-10 89 Q50 47 110 93"/><path d="M34 -10 Q64 50 28 110"/><path d="M66 -10 Q36 50 72 110"/></g></g>
<circle cx="50" cy="50" r="47" fill="url(#vs${u})"/><circle cx="50" cy="50" r="47" fill="none" stroke="#6d5b1e" stroke-width="1.6"/>
<ellipse cx="35" cy="28" rx="14" ry="8" fill="#fff" opacity=".5" transform="rotate(-32 35 28)"/></svg>`,

  avion: (u) => `<svg viewBox="0 0 260 96"><defs>
<linearGradient id="av${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#dde4ed"/><stop offset="1" stop-color="#97a3b4"/></linearGradient>
<linearGradient id="aw${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d2dae5"/><stop offset="1" stop-color="#7c8899"/></linearGradient></defs>
<path d="M120 42 L74 8 L98 8 L168 40Z" fill="#aab5c4"/>
<path d="M34 44 L10 6 L36 6 L62 40Z" fill="url(#aw${u})"/><path d="M30 50 L4 56 L14 62 L48 54Z" fill="#aab5c4"/>
<path d="M16 48 C20 30 60 28 120 28 L205 28 C240 30 255 42 258 48 C250 58 225 64 190 64 L60 64 C34 64 18 58 16 48Z" fill="url(#av${u})" stroke="#8a95a5" stroke-width="1.2"/>
<path d="M20 52 L252 52 C246 57 232 61 215 62 L60 62 C38 62 24 58 20 52Z" fill="#ff2e4d"/><path d="M20 56 L250 56" stroke="#22ff9c" stroke-width="2"/>
<g fill="#4e6f95">${[0,1,2,3,4,5,6,7,8].map((i) => `<circle cx="${72 + i * 15}" cy="42" r="3.4"/>`).join("")}</g>
<path d="M222 36 C236 36 247 40 253 46 L226 46Z" fill="#4e6f95"/>
<path d="M132 50 L84 92 L112 92 L180 52Z" fill="url(#aw${u})" stroke="#7b8797"/>
<ellipse cx="130" cy="76" rx="17" ry="7.5" fill="#c3ccd8" stroke="#7b8797"/></svg>`,

  nube: () => `<svg viewBox="0 0 220 110"><g fill="#fff"><circle cx="64" cy="62" r="34"/><circle cx="108" cy="46" r="42"/><circle cx="156" cy="62" r="32"/><rect x="40" y="62" width="150" height="34" rx="17"/></g><rect x="48" y="80" width="140" height="16" rx="8" fill="#cfd8e3" opacity=".6"/></svg>`,

  plato: (u) => `<svg viewBox="0 0 240 150"><defs>
<radialGradient id="pl${u}" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bcc5d0"/></radialGradient>
<linearGradient id="pa${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe793"/><stop offset="1" stop-color="#dba234"/></linearGradient>
<radialGradient id="sa${u}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ff7352"/><stop offset="1" stop-color="#a81c0c"/></radialGradient></defs>
<ellipse cx="120" cy="124" rx="104" ry="14" fill="rgba(0,0,0,.35)"/>
<ellipse cx="120" cy="102" rx="108" ry="38" fill="url(#pl${u})" stroke="#9fa9b5" stroke-width="1.5"/>
<ellipse cx="120" cy="98" rx="80" ry="26" fill="#f3f5f8" stroke="#cdd3db"/>
<g fill="none" stroke="url(#pa${u})" stroke-width="6" stroke-linecap="round"><path d="M58 96 C68 52 172 52 184 96"/><path d="M66 100 C78 60 164 60 176 100"/><path d="M74 94 C88 46 156 46 168 94"/><path d="M82 100 C94 68 150 68 160 100"/><path d="M60 100 C100 82 142 82 182 100"/><path d="M90 88 C100 56 142 56 152 88"/></g>
<ellipse cx="118" cy="66" rx="36" ry="17" fill="url(#sa${u})"/><ellipse cx="106" cy="61" rx="8" ry="4" fill="#fff" opacity=".35"/>
<path d="M126 54 C138 36 160 40 162 54 C150 64 134 64 126 54Z" fill="#3fae4a"/><path d="M130 55 L156 52" stroke="#25762f" stroke-width="1.5"/>
<circle cx="86" cy="72" r="9" fill="#e53935"/><path d="M82 66 l4 -4 l4 4" stroke="#2f9e44" stroke-width="2" fill="none"/></svg>`,

  ingrediente: () => [
    `<svg viewBox="0 0 20 20"><circle cx="10" cy="11" r="8" fill="#e53935"/><path d="M6 5 l4 -3 l4 3" stroke="#2f9e44" stroke-width="2" fill="none"/></svg>`,
    `<svg viewBox="0 0 20 20"><path d="M3 15 C3 5 12 2 17 4 C17 13 11 18 3 15Z" fill="#43b04f"/></svg>`,
    `<svg viewBox="0 0 30 12"><path d="M2 8 C8 0 14 14 20 4 C23 1 26 3 28 6" fill="none" stroke="#e9b244" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  ][Math.floor(Math.random() * 3)],

  gata: (u) => `<svg viewBox="0 0 320 300"><defs>
<radialGradient id="gh${u}" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#f1b878"/><stop offset="1" stop-color="#c07a38"/></radialGradient>
<radialGradient id="ge${u}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#d4ff9a"/><stop offset="1" stop-color="#4fae2e"/></radialGradient></defs>
<g class="oreja-i"><path d="M62 120 L74 22 L146 78Z" fill="url(#gh${u})" stroke="#8a5222" stroke-width="2"/><path d="M80 98 L84 46 L124 78Z" fill="#f3a3a8"/></g>
<g class="oreja-d"><path d="M258 120 L246 22 L174 78Z" fill="url(#gh${u})" stroke="#8a5222" stroke-width="2"/><path d="M240 98 L236 46 L196 78Z" fill="#f3a3a8"/></g>
<ellipse cx="160" cy="160" rx="118" ry="104" fill="url(#gh${u})" stroke="#8a5222" stroke-width="2"/>
<g stroke="#9a5a22" stroke-width="7" stroke-linecap="round" fill="none"><path d="M160 66 V92"/><path d="M138 70 L142 92"/><path d="M182 70 L178 92"/></g>
<g class="ojo"><ellipse cx="112" cy="150" rx="22" ry="25" fill="url(#ge${u})" stroke="#2f5a1a"/><ellipse cx="112" cy="150" rx="6" ry="19" fill="#111"/><circle cx="104" cy="140" r="5" fill="#fff"/></g>
<g class="ojo"><ellipse cx="208" cy="150" rx="22" ry="25" fill="url(#ge${u})" stroke="#2f5a1a"/><ellipse cx="208" cy="150" rx="6" ry="19" fill="#111"/><circle cx="200" cy="140" r="5" fill="#fff"/></g>
<ellipse cx="160" cy="196" rx="38" ry="26" fill="#f6d3a6"/><path d="M148 182 H172 L160 196Z" fill="#e8838f"/>
<path d="M160 196 V206 M160 206 Q148 222 134 214 M160 206 Q172 222 186 214" stroke="#6b3a16" stroke-width="3" fill="none" stroke-linecap="round"/>
<g stroke="#fff" stroke-opacity=".85" stroke-width="2" stroke-linecap="round"><path d="M96 196 L30 184"/><path d="M96 208 L28 214"/><path d="M96 220 L38 244"/><path d="M224 196 L290 184"/><path d="M224 208 L292 214"/><path d="M224 220 L282 244"/></g>
<ellipse cx="92" cy="272" rx="46" ry="26" fill="url(#gh${u})" stroke="#8a5222" stroke-width="2"/><path d="M76 266 V282 M92 262 V284 M108 266 V282" stroke="#8a5222" stroke-width="2"/>
<ellipse cx="228" cy="272" rx="46" ry="26" fill="url(#gh${u})" stroke="#8a5222" stroke-width="2"/><path d="M212 266 V282 M228 262 V284 M244 266 V282" stroke="#8a5222" stroke-width="2"/></svg>`,

  huella: () => `<svg viewBox="0 0 40 40"><g fill="#fff" fill-opacity=".9"><ellipse cx="20" cy="27" rx="10" ry="8"/><circle cx="8" cy="16" r="4.5"/><circle cx="16" cy="9" r="4.5"/><circle cx="25" cy="9" r="4.5"/><circle cx="33" cy="16" r="4.5"/></g></svg>`,

  ovillo: (u) => `<svg viewBox="0 0 60 60"><defs><radialGradient id="ov${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff7d92"/><stop offset="1" stop-color="#b3102a"/></radialGradient></defs><circle cx="30" cy="30" r="26" fill="url(#ov${u})"/><g fill="none" stroke="#ffd0d8" stroke-width="2" opacity=".7"><path d="M8 22 Q30 40 52 20"/><path d="M6 32 Q30 50 54 32"/><path d="M14 12 Q34 30 50 44"/><path d="M12 46 Q30 20 46 10"/></g></svg>`,

  corazon: (u, c1 = "#ff6b81", c2 = "#b3102a") => `<svg viewBox="0 0 100 90"><defs><radialGradient id="co${u}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><path d="M50 86 C8 54 -6 30 14 12 C29 -1 46 5 50 22 C54 5 71 -1 86 12 C106 30 92 54 50 86Z" fill="url(#co${u})"/><ellipse cx="30" cy="26" rx="10" ry="6" fill="#fff" opacity=".5" transform="rotate(-35 30 26)"/></svg>`,
  corazonMini: () => dib.corazon(U(), Math.random() < .5 ? "#ff8aa0" : "#7dffc2", Math.random() < .5 ? "#c4153b" : "#0a9a58"),

  guitarra: (u) => `<svg viewBox="0 0 120 300"><defs>
<linearGradient id="gb${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a73"/><stop offset=".5" stop-color="#d1102e"/><stop offset="1" stop-color="#6e0618"/></linearGradient>
<linearGradient id="gn${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b3f1d"/><stop offset=".5" stop-color="#a06a34"/><stop offset="1" stop-color="#5a3317"/></linearGradient></defs>
<rect x="52" y="30" width="16" height="130" fill="url(#gn${u})"/><path d="M46 4 H74 L71 36 H49 Z" fill="#2b1a0e"/>
<g fill="#cfd5de"><circle cx="43" cy="12" r="3"/><circle cx="43" cy="24" r="3"/><circle cx="77" cy="12" r="3"/><circle cx="77" cy="24" r="3"/></g>
<path d="M60 148 C30 133 8 148 10 184 C12 204 2 214 8 244 C16 284 50 296 62 296 C80 296 112 286 114 244 C118 214 106 204 110 184 C112 148 90 133 60 148Z" fill="url(#gb${u})" stroke="#3a0410" stroke-width="2"/>
<rect x="42" y="190" width="36" height="8" rx="3" fill="#15151a"/><rect x="42" y="212" width="36" height="8" rx="3" fill="#15151a"/><rect x="44" y="252" width="32" height="10" rx="3" fill="#cfd5de"/>
<g stroke="#eef2f7" stroke-width="1"><line x1="55" y1="10" x2="55" y2="256"/><line x1="58" y1="10" x2="58" y2="256"/><line x1="61" y1="10" x2="61" y2="256"/><line x1="64" y1="10" x2="64" y2="256"/><line x1="67" y1="10" x2="67" y2="256"/></g>
<circle cx="92" cy="236" r="5" fill="#cfd5de"/><circle cx="92" cy="252" r="5" fill="#cfd5de"/>
<path d="M22 172 C24 200 20 214 26 240" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,

  rayo: () => `<svg viewBox="0 0 60 120"><polygon points="38,0 6,66 28,66 16,120 56,40 32,40 46,0" fill="#fff" style="stroke:var(--acento2)" stroke-width="3" stroke-linejoin="round"/></svg>`,

  brujula: (u) => {
    let marcas = "";
    for (let i = 0; i < 36; i++) {
      const largo = i % 9 === 0 ? 14 : 7;
      marcas += `<line x1="100" y1="22" x2="100" y2="${22 + largo}" transform="rotate(${i * 10} 100 100)" stroke="#27303c" stroke-width="${i % 9 === 0 ? 3 : 1.5}"/>`;
    }
    return `<svg viewBox="0 0 200 200"><defs>
<linearGradient id="br${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7b0"/><stop offset=".5" stop-color="#c8a24a"/><stop offset="1" stop-color="#7a5a1c"/></linearGradient>
<radialGradient id="bf${u}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd6e0"/></radialGradient></defs>
<circle cx="100" cy="100" r="97" fill="url(#br${u})"/><circle cx="100" cy="100" r="85" fill="#3a2a0e"/><circle cx="100" cy="100" r="82" fill="url(#bf${u})"/>
${marcas}
<g font-family="Orbitron, sans-serif" font-weight="700" font-size="16" fill="#27303c" text-anchor="middle"><text x="100" y="58">N</text><text x="100" y="152">S</text><text x="148" y="106">E</text><text x="52" y="106">O</text></g>
<g class="aguja"><polygon points="100,34 91,100 109,100" fill="#ff2e4d"/><polygon points="100,166 91,100 109,100" fill="#1fcf86"/></g>
<circle cx="100" cy="100" r="8" fill="#d9dee6" stroke="#6b7482" stroke-width="2"/>
<path d="M40 60 A70 70 0 0 1 120 28" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  },

  pin: (u) => `<svg viewBox="0 0 60 80"><defs><radialGradient id="pn${u}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff7a8e"/><stop offset="1" stop-color="#a30d26"/></radialGradient></defs><path d="M30 78 C30 78 4 46 4 28 C4 12 16 2 30 2 C44 2 56 12 56 28 C56 46 30 78 30 78Z" fill="url(#pn${u})" stroke="#6e0618" stroke-width="1.5"/><circle cx="30" cy="28" r="11" fill="#fff"/></svg>`,

  lupa: (u) => `<svg viewBox="0 0 160 200"><defs>
<radialGradient id="lg${u}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#a0dcff" stop-opacity=".12"/></radialGradient>
<linearGradient id="lm${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f5f9"/><stop offset=".5" stop-color="#9aa6b6"/><stop offset="1" stop-color="#4f5a69"/></linearGradient></defs>
<g transform="rotate(-45 70 70)"><rect x="62" y="122" width="16" height="70" rx="8" fill="#2b2118" stroke="#000" stroke-opacity=".4"/><rect x="60" y="118" width="20" height="10" rx="3" fill="url(#lm${u})"/></g>
<circle cx="70" cy="70" r="56" fill="url(#lg${u})" stroke="url(#lm${u})" stroke-width="9"/>
<path d="M34 62 A38 38 0 0 1 64 34" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,

  chispa: () => `<svg viewBox="0 0 24 24"><path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9Z" fill="#fff"/></svg>`,

  globo: (u, c1, c2) => `<svg viewBox="0 0 60 110"><defs><radialGradient id="bg${u}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><path d="M30 2 C8 2 0 22 4 40 C8 60 22 72 30 77 C38 72 52 60 56 40 C60 22 52 2 30 2Z" fill="url(#bg${u})"/><path d="M26 77 L30 85 L34 77Z" fill="${c2}"/><ellipse cx="18" cy="24" rx="5.5" ry="11" fill="#fff" opacity=".5" transform="rotate(22 18 24)"/><path d="M30 85 C25 94 35 99 30 108" stroke="rgba(255,255,255,.8)" stroke-width="1.2" fill="none"/></svg>`,
};

// =====================  LAS 12 ESCENAS  =====================

// ---------- 1. SOBRE MÍ → reflectores de escenario con confeti ----------
function reflectores() {
  const w = W(), h = H(), rojo = acc1(), verde = acc2();
  const velo = crear({ left: "0px", top: "0px", width: "100vw", height: "100vh", background: "rgba(0,0,0,.5)" });
  mover(velo, [{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85 }, { opacity: 0 }], { duration: 2800 });
  const haz = (x, color, a0, a1, delay) => {
    const e = crear({ left: x + "px", top: "40px", width: Math.max(w * .5, 420) + "px", height: h * 1.15 + "px", transformOrigin: "50% 0%",
      clipPath: "polygon(47% 0, 53% 0, 100% 100%, 0 100%)", mixBlendMode: "screen", filter: "blur(5px)",
      background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 85%, transparent), rgba(255,255,255,.04) 92%)` });
    mover(e, [
      { opacity: 0, transform: `translateX(-50%) rotate(${a0}deg)` },
      { opacity: 1, transform: `translateX(-50%) rotate(${(a0 + a1) / 2}deg)`, offset: .2 },
      { opacity: 1, transform: `translateX(-50%) rotate(${a1}deg)`, offset: .8 },
      { opacity: 0, transform: `translateX(-50%) rotate(${a1}deg)` },
    ], { duration: 2800, delay, easing: "ease-in-out" });
  };
  haz(w * .2, rojo, 40, 10, 0);
  haz(w * .8, verde, -40, -10, 150);
  const charco = crear({ left: w / 2 + "px", top: h * .8 + "px", width: w * .6 + "px", height: "120px", borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(255,255,255,.55), transparent 70%)", filter: "blur(8px)", transform: "translate(-50%,-50%)" });
  mover(charco, [
    { opacity: 0, transform: "translate(-50%,-50%) scale(.3)" },
    { opacity: 1, transform: "translate(-50%,-50%) scale(1)", offset: .3 },
    { opacity: 1, transform: "translate(-50%,-50%) scale(1)", offset: .85 },
    { opacity: 0, transform: "translate(-50%,-50%) scale(1)" },
  ], { duration: 2800, delay: 300 });
  for (let i = 0; i < 18; i++) {
    const s = rnd(2, 5);
    const m = crear({ left: rnd(w * .15, w * .85) + "px", top: rnd(h * .15, h * .8) + "px", width: s + "px", height: s + "px", borderRadius: "50%", background: "rgba(255,255,255,.9)", boxShadow: "0 0 8px #fff" });
    mover(m, [{ opacity: 0, transform: "translate(0,0)" }, { opacity: .9, offset: .3 }, { opacity: 0, transform: `translate(${rnd(-40, 40)}px, ${rnd(-80, -20)}px)` }], { duration: rnd(1500, 2400), delay: rnd(200, 1200) });
  }
  chorro(w / 2, h * .78, 22, { rect: true, colores: [rojo, verde, "#ffffff", "#ffd36b"], tam: [8, 14], vel: [500, 900], ang: [-125, -55], grav: 900, dur: 2000, delay: 1100 });
}

// ---------- 2. GUSTOS → plato de pasta humeante ----------
function pasta(c) {
  const x = c.x, y = c.y + 175, u = U();
  const plato = figura(dib.plato(u), 270, 169, x, y);
  mover(plato, [
    { offset: 0, opacity: 0, transform: T(0, 80, 0, .3) },
    { offset: .18, opacity: 1, transform: T(0, 0, -6, 1.2) },
    { offset: .3, transform: T(0, 8, 5, 1) },
    { offset: .5, transform: T(0, -5, -4, 1.06) },
    { offset: .7, transform: T(0, 4, 3, 1) },
    { offset: .88, opacity: 1, transform: T(0, 0, 0, 1.03) },
    { offset: 1, opacity: 0, transform: T(0, -20, 0, 1.25) },
  ], { duration: 2800 });
  for (let i = 0; i < 10; i++) humo(x + rnd(-45, 45), y - 30, { color: "rgba(255,255,255,.8)", tam: rnd(40, 80), dx: rnd(-50, 50), dy: -rnd(150, 260), dur: rnd(1500, 2100), delay: 250 + i * 150, crece: 3.2 });
  chorro(x, y - 40, 10, { dibujo: dib.ingrediente, tam: [22, 36], vel: [300, 600], ang: [-150, -30], grav: 1100, dur: 1500, delay: 500 });
  onda(x, y, 340, "rgba(255,179,71,.9)", 450, 900);
}

// ---------- 3. HISTORIA → cohete con estela y explosión ----------
function explosion(x, y) {
  destello("255,190,110", .55, 700);
  [["#fff6c2", 90], ["#ffb02e", 150], ["#ff3d00", 210]].forEach(([col, tam], i) => {
    const b = mancha(x, y, tam, col, 10);
    mover(b, [
      { opacity: 1, transform: "translate(-50%,-50%) scale(.2)" },
      { opacity: .9, transform: "translate(-50%,-50%) scale(1.2)", offset: .35 },
      { opacity: 0, transform: "translate(-50%,-50%) scale(1.8)" },
    ], { duration: 900, delay: i * 60 });
  });
  onda(x, y, 460, "rgba(255,179,71,.95)", 0, 900);
  chorro(x, y, 22, { colores: ["#fff2a8", "#ffb02e", "#ff5a1f"], tam: [4, 10], vel: [300, 800], ang: [-180, 180], grav: 600, dur: 1300 });
  sacudir(7, 450);
}
function cohete(c) {
  const w = W(), y = c.y, u = U();
  const r = figura(dib.cohete(u), 200, 82);
  const ruta = [[c.x, y + 20, .3], [c.x + 120, y + 70, 1], [w * .4, y + 150, 1.1], [w * .7, y + 110, 1.25], [w + 220, y - 30, 1.4]];
  volar(r, ruta, { dur: 1900, mira: 1, aparecer: true, cada: 45, alCamino: (x, yy) => {
    humo(x - 70, yy + 6, { color: Math.random() < .5 ? "rgba(255,170,60,.95)" : "rgba(210,210,220,.8)", tam: rnd(30, 70), dx: rnd(-40, 20), dy: rnd(-30, 50), dur: 1200, crece: 2.6 });
  } });
  esperar(1700, () => explosion(w - 90, y));
}

// ---------- 4. HABILIDADES → balón de vóley que rebota ----------
function voley(c) {
  const h = H(), piso = h - 90, x0 = c.x, x1 = Math.min(c.x + 280, W() - 120), u = U();
  const px = (t) => x0 + (x1 - x0) * t;
  const pts = [
    { o: 0,   y: c.y + 30, r: 0,   s: [.3, .3], op: 0, e: "ease-in" },
    { o: .08, y: c.y + 70, r: 30,  s: [1, 1], op: 1, e: "ease-in" },
    { o: .30, y: piso,     r: 240, s: [1, 1], e: "ease-out" },
    { o: .33, y: piso + 14, r: 260, s: [1.35, .65], e: "ease-out" },
    { o: .36, y: piso,     r: 290, s: [1, 1], e: "ease-out" },
    { o: .54, y: piso - h * .42, r: 480, s: [1, 1], e: "ease-in" },
    { o: .70, y: piso,     r: 640, s: [1, 1], e: "ease-out" },
    { o: .73, y: piso + 14, r: 660, s: [1.3, .7], e: "ease-out" },
    { o: .76, y: piso,     r: 680, s: [1, 1], e: "ease-out" },
    { o: .86, y: piso - h * .17, r: 780, s: [1, 1], e: "ease-in" },
    { o: .94, y: piso,     r: 880, s: [1, 1], e: "ease-out" },
    { o: .97, y: piso + 12, r: 900, s: [1.25, .75], e: "ease-out" },
    { o: 1,   y: piso,     r: 940, s: [1, 1], op: 0 },
  ];
  const bola = figura(dib.voley(u), 110, 110);
  mover(bola, pts.map((p) => ({ offset: p.o, opacity: p.op ?? 1, easing: p.e, transform: T(px(p.o), p.y, p.r, p.s) })), { duration: 2800, easing: "linear" });
  const sombra = crear({ left: "0px", top: "0px", width: "110px", height: "18px", borderRadius: "50%", background: "rgba(0,0,0,.55)", filter: "blur(5px)" });
  mover(sombra, pts.map((p) => {
    const alto = Math.max(0, (piso - p.y) / (h * .42));
    return { offset: p.o, opacity: p.o === 0 || p.o === 1 ? 0 : .8 - alto * .5, transform: T(px(p.o), piso + 52, 0, [1 - alto * .6, 1]) };
  }), { duration: 2800, easing: "linear" });
  [.33, .73, .97].forEach((o, i) => esperar(o * 2800 - 20, () => {
    for (let k = 0; k < 5; k++) humo(px(o) + rnd(-30, 30), piso + 50, { color: "rgba(205,190,165,.85)", tam: rnd(28, 55), dx: rnd(-120, 120), dy: -rnd(25, 70), dur: 900, crece: 2.4 });
    onda(px(o), piso + 52, 160 - i * 30, "rgba(255,255,255,.6)", 0, 600);
    sacudir(6 - i * 2, 280);
  }));
}

// ---------- 5. SUEÑOS → avión con estela y nubes ----------
function avion(c) {
  const w = W(), y = c.y, u = U();
  const av = figura(dib.avion(u), 300, 111);
  const ruta = [[-260, y + 120, .7], [w * .3, y + 210, 1.1], [w * .6, y + 120, 1.25], [w + 300, y + 10, .8]];
  volar(av, ruta, { dur: 2800, mira: 1, aparecer: true, cada: 55, alCamino: (x, yy) => {
    humo(x - 110, yy + 18, { color: "rgba(255,255,255,.9)", tam: rnd(26, 48), dx: rnd(-10, 10), dy: rnd(-10, 14), dur: 2000, crece: 3.4 });
  } });
  for (let i = 0; i < 4; i++) {
    const nube = figura(dib.nube(), rnd(160, 300), rnd(80, 140), 0, 0, { filter: "blur(1.5px)" });
    const ny = y + rnd(60, 330);
    mover(nube, [{ opacity: .9, transform: T(w + 320, ny) }, { opacity: .9, transform: T(-340, ny) }], { duration: rnd(3200, 4600), delay: i * 260, easing: "linear" });
  }
}

// ---------- 6. MI ENTORNO → gata que se asoma con globo de diálogo ----------
function gata() {
  const w = W(), h = H(), x = w * .5, u = U();
  const gato = figura(dib.gata(u), 320, 300, x, h);
  mover(gato, [
    { offset: 0, opacity: 1, transform: T(0, 230, 0, 1), easing: "cubic-bezier(.2,1.4,.4,1)" },
    { offset: .16, opacity: 1, transform: T(0, -105, 0, 1) },
    { offset: .8, opacity: 1, transform: T(0, -105, 0, 1) },
    { offset: 1, opacity: 1, transform: T(0, 250, 0, 1) },
  ], { duration: 3400 });
  const globo = crear({ left: x + 150 + "px", top: h - 340 + "px", padding: "10px 20px", borderRadius: "20px", background: "#fff", color: "#111",
    fontFamily: "Poppins, sans-serif", fontWeight: "600", fontSize: "24px", boxShadow: "0 10px 30px rgba(0,0,0,.4)", whiteSpace: "nowrap" }, "¡Miau! 💕");
  mover(globo, [
    { opacity: 0, transform: "scale(0) rotate(-10deg)" },
    { opacity: 1, transform: "scale(1.15) rotate(3deg)", offset: .15 },
    { opacity: 1, transform: "scale(1) rotate(0)", offset: .22 },
    { opacity: 1, transform: "scale(1) rotate(0)", offset: .8 },
    { opacity: 0, transform: "scale(.5) rotate(5deg)" },
  ], { duration: 3000, delay: 500 });
  for (let i = 0; i < 7; i++) {
    const p = pieza(dib.huella(), 34, 34);
    const hx = w * .08 + i * (w * .045), hy = h - 34 + (i % 2 ? 16 : -16);
    mover(p, [
      { opacity: 0, transform: T(hx, hy, 90, .4) },
      { opacity: .9, transform: T(hx, hy, 90, 1), offset: .2 },
      { opacity: 0, transform: T(hx, hy, 90, 1) },
    ], { duration: 1500, delay: 300 + i * 160 });
  }
  const ovillo = figura(dib.ovillo(u), 64, 64, 0, 0, { filter: "none" });
  mover(ovillo, [
    { opacity: 1, transform: T(x + 170, h - 45, 0, 1) },
    { opacity: 1, transform: T(x + 170 + w * .45, h - 45, 900, 1), offset: .9 },
    { opacity: 0, transform: T(x + 170 + w * .5, h - 45, 960, 1) },
  ], { duration: 2200, delay: 1100, easing: "ease-in" });
  chorro(x, h - 160, 8, { dibujo: dib.corazonMini, tam: [18, 32], vel: [150, 350], ang: [-125, -55], grav: -100, dur: 2000, delay: 600 });
}

// ---------- 7. DATO CURIOSO → corazón latiendo y lluvia de corazones ----------
function corazones() {
  const w = W(), h = H(), cx = w / 2, cy = h / 2;
  destello("255,60,120", .3, 900);
  const g = figura(dib.corazon(U(), "#ff6b81", "#b3102a"), 220, 198, cx, cy);
  mover(g, [
    { offset: 0, opacity: 0, transform: T(0, 0, 0, .2) },
    { offset: .15, opacity: 1, transform: T(0, 0, 0, 1.25) },
    { offset: .25, transform: T(0, 0, 0, .95) },
    { offset: .38, transform: T(0, 0, 0, 1.3) },
    { offset: .5, transform: T(0, 0, 0, 1) },
    { offset: .62, transform: T(0, 0, 0, 1.35) },
    { offset: .72, opacity: 1, transform: T(0, 0, 0, 1.05) },
    { offset: 1, opacity: 0, transform: T(0, -120, 0, 1.7) },
  ], { duration: 3000 });
  [.15, .38, .62].forEach((p) => onda(cx, cy, 540, "rgba(255,77,122,.95)", p * 3000, 1000));
  chorro(cx, cy, 24, { dibujo: dib.corazonMini, tam: [22, 56], vel: [350, 900], ang: [-180, 180], grav: 450, dur: 2400, delay: 1700 });
  const pares = [["#ff8aa0", "#c4153b"], ["#7dffc2", "#0a9a58"], ["#ff8aa0", "#c4153b"]];
  for (let i = 0; i < 12; i++) {
    const tam = rnd(30, 70), hx = rnd(20, w - 20), par = pares[i % 3];
    const f = figura(dib.corazon(U(), par[0], par[1]), tam, tam * .9, hx, h + 60);
    mover(f, [
      { offset: 0, opacity: 0, transform: T(0, 0, 0, .6) },
      { offset: .15, opacity: 1, transform: T(rnd(-30, 30), -h * .15, rnd(-20, 20), 1) },
      { offset: .6, opacity: 1, transform: T(rnd(-60, 60), -h * .65, rnd(-30, 30), 1.1) },
      { offset: 1, opacity: 0, transform: T(rnd(-80, 80), -h - 120, rnd(-40, 40), 1.2) },
    ], { duration: rnd(2400, 3600), delay: rnd(0, 1600) });
  }
}

// ---------- 8. MÚSICA → guitarra, rayos y ecualizador ----------
function rock(c) {
  const w = W(), h = H(), gx = Math.max(150, c.x - 170), gy = c.y + 270, u = U();
  const g = figura(dib.guitarra(u), 130, 325, gx, gy);
  const fr = [
    { offset: 0, opacity: 1, transform: T(0, -460, -70, .4) },
    { offset: .12, transform: T(0, 0, -22, 1.25) },
    { offset: .16, transform: T(0, 0, -28, 1) },
  ];
  for (let i = 0; i < 7; i++) fr.push({ offset: .2 + i * .08, transform: T(0, 0, i % 2 ? -40 : -16, 1.06) });
  fr.push({ offset: .9, opacity: 1, transform: T(0, 0, -28, 1.04) });
  fr.push({ offset: 1, opacity: 0, transform: T(0, 40, -28, 1.15) });
  mover(g, fr, { duration: 2600 });
  esperar(300, () => {
    destello("255,255,255", .7, 350);
    onda(gx, gy, 600, "var(--acento1)", 0, 900);
    onda(gx, gy, 440, "var(--acento2)", 100, 900);
    sacudir(11, 600);
    chorro(gx, gy - 40, 16, { colores: [acc1(), acc2(), "#ffffff"], tam: [4, 9], vel: [300, 800], ang: [-180, 0], grav: 700, dur: 1400 });
    chorro(gx, gy - 80, 8, { chars: ["♪", "♫"], txt: "#ffffff", tam: [28, 52], vel: [250, 600], ang: [-150, -30], grav: 300, dur: 1800 });
  });
  for (let i = 0; i < 3; i++) {
    const b = figura(dib.rayo(), rnd(50, 90), rnd(100, 180), rnd(80, w - 80), rnd(120, h * .55), { filter: "drop-shadow(0 0 14px #fff)" });
    mover(b, [{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 0, offset: .2 }, { opacity: 1, offset: .3 }, { opacity: 0, offset: .45 }, { opacity: 0 }], { duration: 700, delay: 400 + i * 260 });
  }
  const barras = 24, ancho = w / barras;
  for (let i = 0; i < barras; i++) {
    const b = crear({ left: i * ancho + "px", bottom: "0px", width: ancho - 4 + "px", height: "10px", borderRadius: "6px 6px 0 0",
      background: "linear-gradient(to top, var(--acento1), var(--acento2))", transformOrigin: "bottom", boxShadow: "0 0 14px var(--acento2)" });
    const pasos = [];
    for (let k = 0; k < 9; k++) pasos.push({ opacity: .85, transform: `scaleY(${rnd(2, 20)})` });
    pasos.push({ opacity: 0, transform: "scaleY(1)" });
    mover(b, pasos, { duration: 2400, delay: 250, easing: "ease-in-out" });
  }
}

// ---------- 9. COLORES → pinceladas de pintura ----------
function pintura(c) {
  const w = W(), h = H(), u = U();
  const ys = [c.y + 110, c.y + 250, c.y + 390].map((y) => Math.min(y, h - 80));
  const cols = [acc1(), acc2(), acc1()];
  const trazos = ys.map((y, i) => {
    const inv = i % 2 === 1;
    return `<path class="tz" d="M ${inv ? w + 120 : -120} ${y} C ${w * .3} ${y - 140}, ${w * .65} ${y + 150}, ${inv ? -120 : w + 120} ${y - 30}" pathLength="1" fill="none" stroke-linecap="round" stroke-width="${84 - i * 8}" style="stroke:${cols[i]};stroke-dasharray:1;stroke-dashoffset:1"/>`;
  }).join("");
  const svg = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs><filter id="rg${u}" x="-10%" y="-40%" width="120%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".012 .06" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#rg${u})">${trazos}</g></svg>`;
  const lienzo = crear({ left: "0px", top: "0px", width: w + "px", height: h + "px" }, svg);
  mover(lienzo, [{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 2700 });
  lienzo.querySelectorAll(".tz").forEach((p, i) => {
    p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: i * 260, fill: "forwards", easing: "cubic-bezier(.5,0,.2,1)" });
  });
  ys.forEach((y, i) => {
    const inv = i % 2 === 1;
    chorro(inv ? w * .08 : w * .92, y - 20, 8, { colores: [cols[i]], tam: [6, 16], vel: [200, 450], ang: [-160, -20], grav: 900, dur: 1000, delay: 700 + i * 260 });
  });
}

// ---------- 10. EMPEZAR EL VIAJE → brújula que se orienta y clava un pin ----------
function brujula(c) {
  const w = W(), h = H(), cx = w / 2, cy = h * .4, u = U();
  const br = figura(dib.brujula(u), 280, 280, cx, cy);
  mover(br, [
    { offset: 0, opacity: 0, transform: T(c.x - cx, c.y - cy, -40, .15) },
    { offset: .25, opacity: 1, transform: T(0, 0, 8, 1.15) },
    { offset: .35, transform: T(0, 0, 0, 1) },
    { offset: .85, opacity: 1, transform: T(0, 0, 0, 1) },
    { offset: 1, opacity: 0, transform: T(0, -30, 0, 1.2) },
  ], { duration: 3000 });
  const ag = br.querySelector(".aguja");
  if (ag) {
    ag.style.transformOrigin = "100px 100px";
    ag.animate([
      { transform: "rotate(0deg)" },
      { transform: "rotate(1400deg)", offset: .45 },
      { transform: "rotate(1210deg)", offset: .6 },
      { transform: "rotate(1290deg)", offset: .72 },
      { transform: "rotate(1240deg)", offset: .82 },
      { transform: "rotate(1260deg)" },
    ], { duration: 2600, delay: 300, fill: "forwards", easing: "ease-out" });
  }
  const pin = figura(dib.pin(U()), 60, 80, cx, cy + 200);
  mover(pin, [
    { offset: 0, opacity: 0, transform: T(0, -380, 0, 1) },
    { offset: .5, opacity: 1, transform: T(0, 0, 0, [1.15, .85]), easing: "ease-out" },
    { offset: .65, transform: T(0, -26, 0, 1), easing: "ease-in" },
    { offset: .8, transform: T(0, 0, 0, 1) },
    { offset: 1, opacity: 0, transform: T(0, 0, 0, 1) },
  ], { duration: 1500, delay: 1500 });
  onda(cx, cy + 240, 260, acc2(), 1950, 900);
  for (let k = 0; k < 4; k++) humo(cx + rnd(-30, 30), cy + 240, { color: "rgba(205,190,165,.8)", tam: rnd(24, 44), dx: rnd(-90, 90), dy: -rnd(15, 45), dur: 800, delay: 1950, crece: 2.2 });
}

// ---------- 11. ¡DESCÚBRELO! → lupa con foco de luz ----------
function detective() {
  const w = W(), h = H(), dur = 2800, t = tok, u = U();
  const oscuro = crear({ left: "0px", top: "0px", width: "100vw", height: "100vh" });
  oscuro.style.setProperty("--lx", "50%");
  oscuro.style.setProperty("--ly", "50%");
  oscuro.style.background = "radial-gradient(circle at var(--lx) var(--ly), transparent 0, transparent 62px, rgba(0,0,0,.84) 135px)";
  oscuro.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .88 }, { opacity: 0 }], { duration: dur, fill: "forwards" }).onfinish = () => oscuro.remove();
  const lupa = figura(dib.lupa(u), 160, 200);
  lupa.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .9 }, { opacity: 0 }], { duration: dur, fill: "forwards" }).onfinish = () => lupa.remove();
  const t0 = performance.now();
  (function paso() {
    const k = (performance.now() - t0) / dur;
    if (k >= 1 || t !== tok) return;
    const x = w / 2 + w * .32 * Math.sin(k * 7.5), y = h / 2 + h * .26 * Math.sin(k * 10.5 + 1);
    oscuro.style.setProperty("--lx", x + "px");
    oscuro.style.setProperty("--ly", y + "px");
    lupa.style.left = x + 10 + "px";      // el centro del cristal queda justo sobre el foco
    lupa.style.top = y + 30 + "px";
    lupa.style.transform = `translate(-50%,-50%) rotate(${Math.sin(k * 9) * 10}deg)`;
    requestAnimationFrame(paso);
  })();
  esperar(2600, () => chorro(w / 2, h / 2, 10, { dibujo: dib.chispa, tam: [24, 48], vel: [250, 600], ang: [-180, 180], grav: 300, dur: 1400 }));
}

// ---------- 12. VOLVER AL INICIO → globos con brillo ----------
function globos() {
  const w = W(), h = H();
  const pares = [["#ff7a8e", "#b3102a"], ["#7dffc2", "#0a9a58"], ["#ff7a8e", "#b3102a"], ["#7dffc2", "#0a9a58"], ["#ffe08a", "#d98a00"], ["#8fc9ff", "#1f66c7"]];
  for (let i = 0; i < 12; i++) {
    const tam = rnd(90, 170), x = rnd(50, w - 50), dur = rnd(3000, 4600), delay = rnd(0, 1100), sway = rnd(30, 70);
    const [c1, c2] = pares[i % pares.length];
    const g = figura(dib.globo(U(), c1, c2), tam * .55, tam);
    const fr = [];
    for (let k = 0; k <= 8; k++) {
      const p = k / 8, dx = Math.sin(p * Math.PI * 3 + i) * sway, dy = -(h + tam * 2) * p;
      fr.push({ offset: p, opacity: p > .9 ? 1 - (p - .9) * 10 : 1, transform: T(x + dx, h + tam * .8 + dy, Math.sin(p * 9 + i) * 7, 1) });
    }
    mover(g, fr, { duration: dur, delay, easing: "linear" });
  }
  chorro(w / 2, h, 26, { rect: true, colores: [acc1(), acc2(), "#ffffff", "#ffd36b"], tam: [8, 14], vel: [500, 1100], ang: [-120, -60], grav: 900, dur: 2200, delay: 1200 });
}

// ---------- Conexión: cada botón con data-fx lanza su escena ----------
const escenas = { reflectores, pasta, cohete, voley, avion, gata, corazones, rock, pintura, brujula, detective, globos };
const duraciones = { reflectores: 2900, pasta: 2900, cohete: 2400, voley: 2900, avion: 3600, gata: 3500, corazones: 4200, rock: 2700, pintura: 2800, brujula: 3100, detective: 2900, globos: 5000 };
let ultimaEscena = "", ultimaHora = 0;

function lanzar(boton) {
  const nombre = boton.dataset.fx;
  if (!escenas[nombre] || document.hidden) return;
  if (nombre === ultimaEscena && Date.now() - ultimaHora < (duraciones[nombre] || 2500)) return;
  ultimaEscena = nombre;
  ultimaHora = Date.now();
  limpiarEscena();                       // la escena anterior se desvanece
  const r = boton.getBoundingClientRect();
  escenas[nombre]({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
}

if (!sinMovimiento) {
  document.querySelectorAll("[data-fx]").forEach((boton) => {
    // Pequeño retraso: si solo cruzas el mouse de pasada, no se dispara
    boton.addEventListener("pointerenter", () => { clearTimeout(boton._espera); boton._espera = setTimeout(() => lanzar(boton), 140); });
    boton.addEventListener("pointerleave", () => clearTimeout(boton._espera));
  });
}
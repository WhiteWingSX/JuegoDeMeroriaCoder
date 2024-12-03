// Constructor para las cartas
function Carta(id, imagen) {
    this.id = id;
    this.imagen = imagen;
    this.descubierta = false;
}

// Variables del juego
const emojis = ['🐸', '🐱', '🐭', '🐯', '🦊', '🐰', '🐻‍❄️', '🐺'];
let cartas = [];
let primeraCarta = null;
let bloqueado = false;

// Control de puntuación
let intentos = 0;
let aciertos = 0;
let puntaje= 0;

// Mejor puntaje
let mejorPuntaje = localStorage.getItem('mejorPuntaje');
mejorPuntaje = mejorPuntaje ? parseInt(mejorPuntaje) : Infinity;

// DOM
// Menu
const pantallaInicio = document.getElementById('pantalla-inicio');
const tablero = document.getElementById('tablero');
const MenuDeJuego = document.getElementById('juego-principal');
// Botones
const reiniciarBtn = document.getElementById('reiniciar');
const MenuDeInicioBtn = document.getElementById('menu-de-inicio');
const comenzarJuegoBtn = document.getElementById('comenzar-juego');
//puntaje
const puntajeActualDisplay = document.getElementById('puntaje-actual');
const mejorPuntajeDisplay = document.getElementById('mejor-puntaje');



// Parametros iniciales
function inicializarJuego() {
    cartas = [];
    primeraCarta = null;
    bloqueado = false;
    intentos = 0;
    aciertos = 0;

    // Crear y barajar cartas
    const cartasDuplicadas = emojis.concat(emojis);
    cartasDuplicadas.sort(() => Math.random() - 0.5);

    cartasDuplicadas.forEach((emoji, index) => {
        cartas.push(new Carta(index, emoji));
    });

    actualizarPuntajeActual();
    actualizarMejorPuntaje();
    renderizarTablero();
}

// Menu de inicio
function mostrarPantallaInicio() {
    MenuDeJuego.style.display = 'none';
    pantallaInicio.style.display = 'block';
    pantallaInicio.style.display = 'flex';
}

// Comenzar el juego
function comenzarJuego() {
    MenuDeJuego.style.display = 'block';
    pantallaInicio.style.display = 'none';
    inicializarJuego();
}

// Tablero
function renderizarTablero() {
    tablero.innerHTML = '';
    cartas.forEach((carta) => {
        const cartaElement = document.createElement('div');
        cartaElement.className = 'carta';
        cartaElement.textContent = carta.descubierta ? carta.imagen : '❓';
        cartaElement.onclick = () => voltearCarta(carta);
        tablero.appendChild(cartaElement);
    });
}

function cambioEstado(carta) {
    carta.descubierta = false;
    primeraCarta.descubierta = false;
    primeraCarta = null;
    bloqueado = false;
    renderizarTablero();
}

// Maneja el volteo de las cartas
function voltearCarta(carta) {
    if (bloqueado || carta.descubierta || (primeraCarta && carta === primeraCarta)) return;

    carta.descubierta = true;
    renderizarTablero();

    if (!primeraCarta) {
        primeraCarta = carta;
    } else {
        intentos++;
        if (primeraCarta.imagen === carta.imagen) {
            aciertos += 100;
            primeraCarta = null;
            if (cartas.every((carta) => carta.descubierta)) {
                actualizarPuntajeActual()
                guardarMejorPuntaje();
            }
        } else {
            bloqueado = true;
            cambioEstado(carta);
        }
        actualizarPuntajeActual(); // Actualizar puntaje después del intento
    }
}

// Guarda el mejor puntaje en localStorage
function guardarMejorPuntaje() {
    if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        localStorage.setItem('mejorPuntaje', mejorPuntaje);
        actualizarMejorPuntaje();
    }
}

// Actualiza el puntaje actual en la pantalla
function actualizarPuntajeActual() {
    puntaje = aciertos - (intentos * 10);
    puntajeActualDisplay.textContent = `Puntaje Actual: ${puntaje}`;
}

// Actualiza el mejor puntaje en la pantalla
function actualizarMejorPuntaje() {
    mejorPuntajeDisplay.textContent = `Mejor Puntaje: ${mejorPuntaje === Infinity ? 0 : mejorPuntaje}`;
}

// Reinicia el juego
reiniciarBtn.onclick = inicializarJuego;
comenzarJuegoBtn.onclick = comenzarJuego;
MenuDeInicioBtn.onclick = mostrarPantallaInicio;

// Inicia el juego al cargar la página
inicializarJuego();

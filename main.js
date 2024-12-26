//Libreria Howler (control de sonido)
Howler.volume(0.1);

// Control de sonido
let backgroundSound = new Howl({
    src: ['./assets/sounds/backgroundSound.mp3'],
    autoplay: true,
    loop: true,
    volume: 0.1,
});

let cardSound = new Howl({
    src: ['./assets/sounds/cardSound.mp3'],
});

let correctCardSound = new Howl({
    src: ['./assets/sounds/correctCardSound.mp3'],
});

// Constructor para las cartas
function Carta(id, imagen, pokemonImagen) {
    this.id = id;
    this.imagen = imagen;
    this.pokemonImagen = pokemonImagen;
    this.descubierta = false;
}

// Variables del juego
const emojis = ['🐸', '🐱', '🐭', '🐯', '🦊', '🐰', '🐻‍❄️', '🐺'];

// Mapeo de emojis a Pokemon en la PokeAPI
const emojiToPokemon = {
    '🐸': 'greninja',
    '🐱': 'meowth',
    '🐭': 'pikachu',
    '🐯': 'incineroar',
    '🦊': 'eevee',
    '🐰': 'lopunny',
    '🐻‍❄️': 'ursaring',
    '🐺': 'lucario',
};

// Funcion para obtener las imágenes de la PokeAPI
const fetchImagesForPokemons = async () => {
    const imageUrls = [];

    // Iterar sobre las claves de emojiToPokemon
    for (let emoji in emojiToPokemon) {
        const pokemonName = emojiToPokemon[emoji];
        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

        try {
            // Ontencion del sprite del pokemon
            const response = await fetch(url);
            const data = await response.json();
            const imageUrl = data.sprites.front_default;
            imageUrls.push({ emoji, imageUrl });
        } catch (error) {
            // En caso de no obtener la imagen sera null
            console.error('Error fetching Pokémon image:', error);
            imageUrls.push({ emoji, imageUrl: null });
        }
    }

    return imageUrls;
};

// Variables del juego
let cartas = [];
let primeraCarta = null;
let bloqueado = false;

// Control de puntuación
let intentos = 0;
let aciertos = 0;
let puntaje = 0;
let puntuaciones = JSON.parse(localStorage.getItem('puntuaciones')) || [];

// Mejor puntaje
let mejorPuntaje = localStorage.getItem('mejorPuntaje');
mejorPuntaje = mejorPuntaje ? parseInt(mejorPuntaje) : Infinity;

// Jugador
let nombreJugador = 'Player';

// DOM
// Menú
const pantallaInicio = document.getElementById('pantalla-inicio');
const tablero = document.getElementById('tablero');
const MenuDeJuego = document.getElementById('juego-principal');
const pantallaVictoria = document.getElementById('pantalla-victoria');
// Botones
const reiniciarBtn = document.getElementById('reiniciar');
const MenuDeInicioBtn = document.getElementById('menu-de-inicio');
const comenzarJuegoBtn = document.getElementById('comenzar-juego');
const regresarInicioBtn = document.getElementById('regresar-inicio');
// Puntaje
const puntajeActualDisplay = document.getElementById('puntaje-actual');
const mejorPuntajeDisplay = document.getElementById('mejor-puntaje');
const mejoresPuntajesList = document.getElementById('mejores-puntajes');

// Inicialización del juego
async function inicializarJuego() {
    cartas = [];
    primeraCarta = null;
    bloqueado = false;
    intentos = 0;
    aciertos = 0;

    const images = await fetchImagesForPokemons();  // Llamamos a la función para obtener las imágenes

    // Crear y barajar cartas
    const cartasDuplicadas = emojis.concat(emojis);
    cartasDuplicadas.sort(() => Math.random() - 0.5);

    cartasDuplicadas.forEach((emoji, index) => {
        const pokemonImagen = images.find((image) => image.emoji === emoji)?.imageUrl || 'ruta_por_defecto';  // Imagen de Pokémon
        cartas.push(new Carta(index, emoji, pokemonImagen));  // Crear carta con imagen de Pokémon
    });

    actualizarPuntajeActual();
    actualizarMejorPuntaje();
    renderizarTablero();
}

// Menú de inicio
function mostrarPantallaInicio() {
    backgroundSound.play();
    MenuDeJuego.style.display = 'none';
    pantallaVictoria.style.display = 'none';
    pantallaInicio.style.display = 'block';
    pantallaInicio.style.display = 'flex';
}

// Comenzar el juego
function comenzarJuego() {
    const inputNombre = document.getElementById('nombre-jugador');
    nombreJugador = inputNombre.value.trim() || 'jugador';
    console.log(`Nombre del jugador: ${nombreJugador}`);

    MenuDeJuego.style.display = 'block';
    pantallaVictoria.style.display = 'none';
    pantallaInicio.style.display = 'none';
    inicializarJuego();
}

// Reiniciar juego
reiniciarBtn.onclick = function () {
    pantallaVictoria.style.display = 'none';
    MenuDeJuego.style.display = 'none';
    inicializarJuego();
};

// Renderizar el tablero
function renderizarTablero() {
    tablero.innerHTML = '';  // Limpiar tablero antes de renderizar
    cartas.forEach((carta) => {
        const cartaElement = document.createElement('div');
        cartaElement.className = 'carta';
        cartaElement.innerHTML = carta.descubierta ? `<img src="${carta.pokemonImagen}" alt="${carta.imagen}" />` : '❓';
        cartaElement.onclick = () => voltearCarta(carta);
        tablero.appendChild(cartaElement);
    });
}

// Cambio de estado para cartas incorrectas
function cambioEstado(carta) {
    bloqueado = true;
    setTimeout(() => {
        carta.descubierta = false;
        primeraCarta.descubierta = false;
        primeraCarta = null;
        bloqueado = false;
        renderizarTablero();
    }, 1000);
}

// Volteo de las cartas
function voltearCarta(carta) {
    if (bloqueado || carta.descubierta || (primeraCarta && carta === primeraCarta)) return;

    carta.descubierta = true;
    cardSound.play();
    renderizarTablero();

    if (!primeraCarta) {
        primeraCarta = carta;
    } else {
        intentos++;
        if (primeraCarta.imagen === carta.imagen) {
            aciertos += 110;
            cardSound.play();
            correctCardSound.play()
            primeraCarta = null;
            if (cartas.every((carta) => carta.descubierta)) {
                cardSound.play();
                actualizarPuntajeActual();
                guardarMejorPuntaje();
                final();
            }
        } else {
            bloqueado = true;
            cambioEstado(carta);
        }
        actualizarPuntajeActual();
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

// Pantalla Final del juego con puntuación y tabla
function final() {
    puntuaciones.push({ nombre: nombreJugador, puntaje: puntaje });
    puntuaciones.sort((a, b) => b.puntaje - a.puntaje);

    if (puntuaciones.length > 5) puntuaciones = puntuaciones.slice(0, 5);

    localStorage.setItem('puntuaciones', JSON.stringify(puntuaciones));

    pantallaVictoria.style.display = 'block';
    pantallaVictoria.style.display = 'flex';

    const nombreGanadorDisplay = document.getElementById('nombre-ganador');
    const puntajeTotalDisplay = document.getElementById('puntaje-total');

    nombreGanadorDisplay.textContent = nombreJugador;
    puntajeTotalDisplay.textContent = puntaje;

    mejoresPuntajesList.innerHTML = '';
    puntuaciones.forEach((p, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `#${index + 1}: ${p.nombre} ............... ${p.puntaje} puntos.`;
        mejoresPuntajesList.appendChild(listItem);
    });
}

// Formas de reiniciar el juego
reiniciarBtn.onclick = inicializarJuego;
comenzarJuegoBtn.onclick = comenzarJuego;
MenuDeInicioBtn.onclick = mostrarPantallaInicio;
regresarInicioBtn.onclick = mostrarPantallaInicio;

// Inicia el juego al cargar la página
inicializarJuego();

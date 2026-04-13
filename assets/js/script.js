const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let zombies = [];
let explosiones = [];

let score = 0;
let nivel = 1;
let vidas = 5;
let jugando = false;

let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").textContent = highScore;

// IMÁGENES
const fondo = new Image();
fondo.src = "assets/img/fondo.jpg";

const zombieImg = new Image();
zombieImg.src = "assets/img/zombie.png";

const explosionImg = new Image();
explosionImg.src = "assets/img/explosion.png";

// SONIDOS
const disparo = new Audio("assets/audio/disparo.mp3");
const zombieSound = new Audio("assets/audio/zombie.mp3");
const gameOverSound = new Audio("assets/audio/gameover.mp3");

// MÚSICA
const musica = new Audio("assets/audio/musica.mp3");
musica.loop = true;
musica.volume = 0.2;

// FUNCIONES
function reproducirSonido(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function iniciarJuego() {
    jugando = true;
    musica.play().catch(() => {});
}

function pausar() {
    jugando = !jugando;

    if (jugando) musica.play();
    else musica.pause();
}

function toggleMusica() {
    if (musica.paused) musica.play();
    else musica.pause();
}

// CREAR ZOMBIE
function crearZombie() {
    zombies.push({
        x: Math.random() * 850,
        y: Math.random() * 450,
        size: 60,
        dx: (Math.random() - 0.5) * (1 + nivel * 0.5),
        dy: (Math.random() - 0.5) * (1 + nivel * 0.5),
        vida: 120
    });

    reproducirSonido(zombieSound);
}

// UPDATE
function update() {

    ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!jugando) {
        requestAnimationFrame(update);
        return;
    }

    zombies.forEach((z, i) => {
        z.x += z.dx;
        z.y += z.dy;
        z.vida--;

        ctx.drawImage(zombieImg, z.x, z.y, z.size, z.size);

        if (z.vida <= 0) {
            zombies.splice(i, 1);
            vidas--;
        }
    });

    explosiones.forEach((ex, i) => {
        ctx.drawImage(explosionImg, ex.x, ex.y, ex.size, ex.size);
        ex.tiempo--;

        if (ex.tiempo <= 0) explosiones.splice(i, 1);
    });

    document.getElementById("score").textContent = score;
    document.getElementById("nivel").textContent = nivel;
    document.getElementById("vidas").textContent = vidas;

    if (vidas <= 0) {
        musica.pause();
        reproducirSonido(gameOverSound);
        alert("💀 GAME OVER");
        location.reload();
    }

    requestAnimationFrame(update);
}

// CLICK
canvas.addEventListener("click", (e) => {

    if (!jugando) return;

    reproducirSonido(disparo);

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(mx, my, 20, 0, Math.PI * 2);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.stroke();

    zombies.forEach((z, i) => {
        if (
            mx > z.x &&
            mx < z.x + z.size &&
            my > z.y &&
            my < z.y + z.size
        ) {
            explosiones.push({
                x: z.x,
                y: z.y,
                size: 60,
                tiempo: 20
            });

            zombies.splice(i, 1);
            score += 10;

             if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
                document.getElementById("highScore").textContent = highScore;
            }
        }
    });
});

// GENERACIÓN
setInterval(() => {
    if (jugando) crearZombie();
}, 1000);

// DIFICULTAD
setInterval(() => {
    if (jugando) nivel++;
}, 5000);

update();
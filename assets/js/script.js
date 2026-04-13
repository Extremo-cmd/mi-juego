const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const zombieSound = new Audio("assets/audio/zombie.mp3");

let zombies = [];
let explosiones = [];

const explosionImg = new Image();
explosionImg.src = "assets/img/explosion.png";

let score = 0;
let nivel = 1;
let vida = 100;

let jugando = false;
let pausado = false;

const centroX = canvas.width / 2;
const centroY = canvas.height / 2;

let mouseX = 0;
let mouseY = 0;

// IMÁGENES
const fondo = new Image();
fondo.src = "assets/img/fondo.jpg";

const zombieImg = new Image();
zombieImg.src = "assets/img/zombie.png";

// SONIDOS
const disparo = new Audio("assets/audio/disparo.mp3");
const hit = new Audio("assets/audio/zombie.mp3");
const musica = new Audio("assets/audio/musica.mp3");

musica.loop = true;

// FUNCIONES
function startGame(){
    document.getElementById("menu").style.display = "none";
    jugando = true;
    musica.play().catch(()=>{});
}

function pausar(){
    pausado = !pausado;
}

// CREAR ZOMBIE
function crearZombie(){
    let lado = Math.floor(Math.random()*4);
    let x,y;

    if(lado===0){x=0;y=Math.random()*canvas.height;}
    if(lado===1){x=canvas.width;y=Math.random()*canvas.height;}
    if(lado===2){x=Math.random()*canvas.width;y=0;}
    if(lado===3){x=Math.random()*canvas.width;y=canvas.height;}

    zombies.push({x,y,size:60,speed:1+nivel*0.3});
}

zombieSound.currentTime = 0;
zombieSound.play().catch(()=>{});
// UPDATE
function update(){

    ctx.drawImage(fondo,0,0,canvas.width,canvas.height);

    ctx.fillStyle="rgba(0,0,0,0.3)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if(!jugando){
        requestAnimationFrame(update);
        return;
    }
    if(pausado){
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "40px Orbitron";
    ctx.fillText("PAUSA", canvas.width/2 - 80, canvas.height/2);

    requestAnimationFrame(update);
    return;
}

// EXPLOSIONES
explosiones.forEach((ex, i) => {
    ctx.drawImage(explosionImg, ex.x, ex.y, ex.size, ex.size);
    ex.tiempo--;

    if (ex.tiempo <= 0) {
        explosiones.splice(i, 1);
    }
});

    // ZOMBIES
    zombies.forEach((z,i)=>{
        let dx = centroX - z.x;
        let dy = centroY - z.y;
        let dist = Math.sqrt(dx*dx+dy*dy);

        z.x += (dx/dist)*z.speed;
        z.y += (dy/dist)*z.speed;

        ctx.drawImage(zombieImg,z.x,z.y,z.size,z.size);

        if(dist<20){
            zombies.splice(i,1);
            vida -= 10;
            hit.play().catch(()=>{});
        }
    });

    // CROSSHAIR
ctx.strokeStyle = "red";
ctx.lineWidth = 2;

ctx.beginPath();
ctx.moveTo(mouseX - 10, mouseY);
ctx.lineTo(mouseX + 10, mouseY);
ctx.moveTo(mouseX, mouseY - 10);
ctx.lineTo(mouseX, mouseY + 10);
ctx.stroke();

    // UI HTML
    document.getElementById("score").textContent = score;
    document.getElementById("nivel").textContent = nivel;
    document.getElementById("vida").textContent = vida;

    // GAME OVER
    if(vida <= 0){
        alert("💀 GAME OVER");
        location.reload();
    }

    requestAnimationFrame(update);
}

// CLICK
canvas.addEventListener("click",(e)=>{
    if(!jugando || pausado) return;

    disparo.play().catch(()=>{});

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    zombies.forEach((z,i)=>{
        if(mx>z.x && mx<z.x+z.size && my>z.y && my<z.y+z.size){
            zombies.splice(i,1);
            score += 10;
        }
    });
});

zombies.forEach((z, i) => {
    if (mx > z.x && mx < z.x + z.size && my > z.y && my < z.y + z.size) {

        // EXPLOSIÓN
        explosiones.push({
            x: z.x,
            y: z.y,
            size: 60,
            tiempo: 20
        });

        zombies.splice(i, 1);
        score += 10;
    }
});

// FLASH
ctx.fillStyle = "rgba(255,255,255,0.2)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// MOUSE
canvas.addEventListener("mousemove",(e)=>{
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// SPAWN
setInterval(()=>{
    if(jugando && !pausado) crearZombie();
},1200);

// NIVEL
setInterval(()=>{
    if(jugando && !pausado) nivel++;
},6000);

update();
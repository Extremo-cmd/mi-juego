const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let zombies = [];
let explosiones = [];

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

const explosionImg = new Image();
explosionImg.src = "assets/img/explosion.png";

// SONIDOS
const disparo = new Audio("assets/audio/disparo.mp3");
const zombieSound = new Audio("assets/audio/zombie.mp3");
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

    zombies.push({x,y,size:60,speed:1+nivel*0.4});
}

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
        ctx.fillStyle="rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle="#00ffcc";
        ctx.font="50px Orbitron";
        ctx.fillText("⏸ PAUSA", centroX-130, centroY);

        requestAnimationFrame(update);
        return;
    }

    // 🔵 CENTRO (OBJETIVO)
    ctx.beginPath();
    ctx.arc(centroX, centroY, 25, 0, Math.PI*2);
    ctx.fillStyle = "cyan";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centroX, centroY, 40, 0, Math.PI*2);
    ctx.strokeStyle = "#00ffcc";
    ctx.stroke();

    // ZOMBIES
    zombies.forEach((z,i)=>{
        let dx = centroX - z.x;
        let dy = centroY - z.y;
        let dist = Math.sqrt(dx*dx+dy*dy);

        z.x += (dx/dist)*z.speed;
        z.y += (dy/dist)*z.speed;

        ctx.drawImage(zombieImg,z.x,z.y,z.size,z.size);

        if(dist<30){
            zombies.splice(i,1);
            vida -= 10;

            ctx.fillStyle="rgba(255,0,0,0.3)";
            ctx.fillRect(0,0,canvas.width,canvas.height);

            zombieSound.play().catch(()=>{});
        }
    });

    // EXPLOSIONES
    explosiones.forEach((ex,i)=>{
        ctx.globalAlpha = ex.tiempo / 20;
        ctx.drawImage(explosionImg, ex.x, ex.y, ex.size, ex.size);
        ctx.globalAlpha = 1;

        ex.tiempo--;
        if(ex.tiempo<=0) explosiones.splice(i,1);
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

    // UI
    document.getElementById("score").textContent = score;
    document.getElementById("nivel").textContent = nivel;
    document.getElementById("vida").textContent = vida;

    // GAME OVER
    if(vida <= 0){
        document.getElementById("finalScore").textContent = score;
        document.getElementById("gameOver").style.display = "flex";
        jugando = false;
        return;
    }

    requestAnimationFrame(update);
}

// CLICK
canvas.addEventListener("click",(e)=>{
    if(!jugando || pausado) return;

    disparo.currentTime = 0;
    disparo.play().catch(()=>{});

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    zombies.forEach((z,i)=>{
        if(mx>z.x && mx<z.x+z.size && my>z.y && my<z.y+z.size){

            explosiones.push({
                x:z.x,
                y:z.y,
                size:70,
                tiempo:20
            });

            zombies.splice(i,1);
            score += 10;
        }
    });
});

// MOUSE
canvas.addEventListener("mousemove",(e)=>{
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// SPAWN
setInterval(()=>{
    if(jugando && !pausado) crearZombie();
},1000);

// NIVEL
setInterval(()=>{
    if(jugando && !pausado) nivel++;
},5000);

update();
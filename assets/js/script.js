const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let zombies = [];
let explosiones = [];

let score = 0;
let nivel = 1;
let vida = 100;
let jugando = false;

let mouseX = 0;
let mouseY = 0;
let shake = 0;

const centroX = canvas.width / 2;
const centroY = canvas.height / 2;

// IMÁGENES
const fondo = new Image();
fondo.src = "assets/img/fondo.jpg";

const zombieImg = new Image();
zombieImg.src = "assets/img/zombie.png";

const explosionImg = new Image();
explosionImg.src = "assets/img/explosion.png";

const armaImg = new Image();
armaImg.src = "assets/img/arma.png";

// SONIDOS
const disparo = new Audio("assets/audio/disparo.mp3");
const hit = new Audio("assets/audio/zombie.mp3");
const gameOverSound = new Audio("assets/audio/gameover.mp3");
const musica = new Audio("assets/audio/musica.mp3");

musica.loop = true;
musica.volume = 0.2;

// FUNCIONES
function reproducir(audio){
    audio.currentTime = 0;
    audio.play().catch(()=>{});
}

function startGame(){
    document.getElementById("menu").style.display = "none";
    jugando = true;
    musica.play().catch(()=>{});
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

    let dx = (Math.random()-0.5)*shake;
    let dy = (Math.random()-0.5)*shake;
    ctx.setTransform(1,0,0,1,dx,dy);

    ctx.drawImage(fondo,0,0,canvas.width,canvas.height);

    ctx.fillStyle="rgba(0,0,0,0.4)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if(!jugando){
        requestAnimationFrame(update);
        return;
    }

    // VIDA
    ctx.fillStyle="red";
    ctx.fillRect(20,20,200,20);
    ctx.fillStyle="lime";
    ctx.fillRect(20,20,vida*2,20);

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
            vida-=10;

            ctx.fillStyle="rgba(255,0,0,0.3)";
            ctx.fillRect(0,0,canvas.width,canvas.height);

            reproducir(hit);
        }
    });

    // EXPLOSIONES
    explosiones.forEach((ex,i)=>{
        ctx.drawImage(explosionImg,ex.x,ex.y,ex.size,ex.size);

        ctx.fillStyle="red";
        ctx.beginPath();
        ctx.arc(ex.x+30,ex.y+30,10,0,Math.PI*2);
        ctx.fill();

        ex.t--;
        if(ex.t<=0) explosiones.splice(i,1);
    });

    // CROSSHAIR
    ctx.strokeStyle="yellow";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(mouseX,mouseY,15,0,Math.PI*2);
    ctx.stroke();

    // ARMA
    ctx.drawImage(armaImg, canvas.width-200, canvas.height-200, 200,200);

    // UI
    document.getElementById("score").textContent=score;
    document.getElementById("nivel").textContent=nivel;

    if(vida<=0){
        musica.pause();
        reproducir(gameOverSound);
        alert("💀 GAME OVER");
        location.reload();
    }

    shake *= 0.9;

    requestAnimationFrame(update);
}

// DISPARO
canvas.addEventListener("click",(e)=>{
    if(!jugando) return;

    reproducir(disparo);
    shake = 10;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    zombies.forEach((z,i)=>{
        if(mx>z.x && mx<z.x+z.size && my>z.y && my<z.y+z.size){
            explosiones.push({x:z.x,y:z.y,size:60,t:15});
            zombies.splice(i,1);
            score+=10;
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
    if(jugando) crearZombie();
},1000);

// NIVEL
setInterval(()=>{
    if(jugando) nivel++;
},5000);

update();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let W = 1200;
let H = 700;

canvas.width = W;
canvas.height = H;

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;

    if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
        .includes(e.key.toLowerCase())
    ) {
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});


// ======================================
// JOGADORES
// ======================================

let fire;
let water;

function criarJogadores() {

    fire = {
        x: 80,
        y: 560,
        width: 34,
        height: 45,
        vx: 0,
        vy: 0,
        speed: 4.5,
        jump: -11,
        grounded: false,
        alive: true,
        color: "#ff4d32"
    };

    water = {
        x: 140,
        y: 560,
        width: 34,
        height: 45,
        vx: 0,
        vy: 0,
        speed: 4.5,
        jump: -11,
        grounded: false,
        alive: true,
        color: "#36a9ff"
    };
}


// ======================================
// MAPA
// ======================================

const platforms = [

    // chão
    {x: 0, y: 620, w: 1200, h: 80},

    // plataformas
    {x: 100, y: 500, w: 230, h: 25},
    {x: 410, y: 430, w: 200, h: 25},
    {x: 690, y: 510, w: 190, h: 25},
    {x: 920, y: 420, w: 180, h: 25},

    // plataformas superiores
    {x: 250, y: 330, w: 180, h: 25},
    {x: 520, y: 260, w: 190, h: 25},
    {x: 800, y: 320, w: 180, h: 25}
];


// ======================================
// LAVA
// ======================================

const lava = [
    {x: 335, y: 590, w: 75, h: 30},
    {x: 610, y: 590, w: 80, h: 30},
    {x: 880, y: 590, w: 80, h: 30}
];


// ======================================
// ÁGUA
// ======================================

const waterPools = [
    {x: 500, y: 580, w: 100, h: 40},
    {x: 760, y: 580, w: 100, h: 40}
];


// ======================================
// PORTAS
// ======================================

const fireDoor = {
    x: 1060,
    y: 355,
    w: 40,
    h: 65
};

const waterDoor = {
    x: 1110,
    y: 355,
    w: 40,
    h: 65
};


// ======================================
// FÍSICA
// ======================================

const gravity = 0.55;


function atualizarJogador(player, tipo) {

    if (!player.alive) return;

    let esquerda;
    let direita;
    let pular;

    if (tipo === "fire") {
        esquerda = keys["a"];
        direita = keys["d"];
        pular = keys["w"];
    } else {
        esquerda = keys["arrowleft"];
        direita = keys["arrowright"];
        pular = keys["arrowup"];
    }

    player.vx = 0;

    if (esquerda) {
        player.vx = -player.speed;
    }

    if (direita) {
        player.vx = player.speed;
    }

    if (pular && player.grounded) {
        player.vy = player.jump;
        player.grounded = false;
    }

    player.vy += gravity;

    // movimento horizontal
    player.x += player.vx;

    // colisão horizontal com paredes
    for (const p of platforms) {

        if (colide(player, p)) {

            if (player.vx > 0) {
                player.x = p.x - player.width;
            }

            if (player.vx < 0) {
                player.x = p.x + p.w;
            }
        }
    }

    // movimento vertical
    player.y += player.vy;

    player.grounded = false;

    for (const p of platforms) {

        if (colide(player, p)) {

            if (player.vy > 0) {
                player.y = p.y - player.height;
                player.vy = 0;
                player.grounded = true;
            }

            if (player.vy < 0) {
                player.y = p.y + p.h;
                player.vy = 0;
            }
        }
    }

    // limites
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > W) {
        player.x = W - player.width;
    }

    // caiu do mapa
    if (player.y > H + 100) {
        player.alive = false;
    }

    // perigos
    verificarPerigos(player, tipo);
}


// ======================================
// COLISÃO
// ======================================

function colide(a, b) {

    return (
        a.x < b.x + b.w &&
        a.x + a.width > b.x &&
        a.y < b.y + b.h &&
        a.y + a.height > b.y
    );
}


// ======================================
// PERIGOS
// ======================================

function verificarPerigos(player, tipo) {

    for (const l of lava) {

        if (colide(player, l)) {

            if (tipo === "water") {
                player.alive = false;
            }
        }
    }

    for (const w of waterPools) {

        if (colide(player, w)) {

            if (tipo === "fire") {
                player.alive = false;
            }
        }
    }
}


// ======================================
// PORTAS
// ======================================

function chegouNaPorta(player, porta) {

    return colide(player, porta);
}


function verificarVitoria() {

    if (
        chegouNaPorta(fire, fireDoor) &&
        chegouNaPorta(water, waterDoor)
    ) {

        jogoTerminou = true;

        mostrarMensagem("🎉 OS DOIS VENCERAM!");
    }

    if (!fire.alive || !water.alive) {

        jogoTerminou = true;

        mostrarMensagem("💥 VOCÊS PERDERAM!");
    }
}


// ======================================
// DESENHO DO MAPA
// ======================================

function desenharMapa() {

    // fundo
    const gradiente = ctx.createLinearGradient(0, 0, 0, H);

    gradiente.addColorStop(0, "#101936");
    gradiente.addColorStop(1, "#191027");

    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, W, H);


    // estrelas
    ctx.fillStyle = "rgba(255,255,255,.4)";

    for (let i = 0; i < 70; i++) {

        const x = (i * 173) % W;
        const y = (i * 97) % 350;

        ctx.fillRect(x, y, 2, 2);
    }


    // plataformas
    for (const p of platforms) {

        const grad = ctx.createLinearGradient(
            0,
            p.y,
            0,
            p.y + p.h
        );

        grad.addColorStop(0, "#6947a5");
        grad.addColorStop(1, "#38265d");

        ctx.fillStyle = grad;
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = "#8d6ac4";
        ctx.fillRect(p.x, p.y, p.w, 5);
    }


    // lava
    for (const l of lava) {

        ctx.fillStyle = "#e72d20";
        ctx.fillRect(l.x, l.y, l.w, l.h);

        ctx.fillStyle = "#ff7b00";

        for (let x = l.x; x < l.x + l.w; x += 15) {

            ctx.beginPath();

            ctx.arc(
                x + 7,
                l.y + 5,
                8,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }


    // água
    for (const w of waterPools) {

        ctx.fillStyle = "#168de2";
        ctx.fillRect(w.x, w.y, w.w, w.h);

        ctx.fillStyle = "#62c7ff";

        for (let x = w.x; x < w.x + w.w; x += 20) {

            ctx.beginPath();

            ctx.arc(
                x + 10,
                w.y + 4,
                10,
                Math.PI,
                Math.PI * 2
            );

            ctx.fill();
        }
    }


    desenharPorta(fireDoor, "#ff4d32", "🔥");
    desenharPorta(waterDoor, "#36a9ff", "💧");
}


// ======================================
// PORTAS
// ======================================

function desenharPorta(porta, cor, emoji) {

    ctx.fillStyle = "#171722";

    ctx.fillRect(
        porta.x,
        porta.y,
        porta.w,
        porta.h
    );

    ctx.strokeStyle = cor;
    ctx.lineWidth = 4;

    ctx.strokeRect(
        porta.x,
        porta.y,
        porta.w,
        porta.h
    );

    ctx.font = "25px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        emoji,
        porta.x + porta.w / 2,
        porta.y + 40
    );
}


// ======================================
// DESENHAR JOGADORES
// ======================================

function desenharJogador(player, tipo) {

    if (!player.alive) return;

    ctx.save();

    ctx.translate(
        player.x + player.width / 2,
        player.y + player.height / 2
    );


    // corpo
    ctx.fillStyle = player.color;

    ctx.beginPath();

    ctx.roundRect(
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height,
        10
    );

    ctx.fill();


    // brilho
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 15;


    // olhos
    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(-7, -8, 5, 0, Math.PI * 2);
    ctx.arc(7, -8, 5, 0, Math.PI * 2);
    ctx.fill();


    ctx.fillStyle = "#111";

    ctx.beginPath();
    ctx.arc(-7, -8, 2, 0, Math.PI * 2);
    ctx.arc(7, -8, 2, 0, Math.PI * 2);
    ctx.fill();


    // símbolo
    ctx.font = "15px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        tipo === "fire" ? "🔥" : "💧",
        0,
        20
    );

    ctx.restore();
}


// ======================================
// CÂMERA / DESENHO
// ======================================

function desenhar() {

    desenharMapa();

    desenharJogador(fire, "fire");
    desenharJogador(water, "water");
}


// ======================================
// LOOP DO JOGO
// ======================================

let jogoRodando = false;
let jogoTerminou = false;

function loop() {

    if (!jogoRodando) return;

    if (!jogoTerminou) {

        atualizarJogador(fire, "fire");
        atualizarJogador(water, "water");

        verificarVitoria();
    }

    desenhar();

    requestAnimationFrame(loop);
}


// ======================================
// MENU
// ======================================

function iniciarJogo() {

    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    criarJogadores();

    jogoTerminou = false;
    jogoRodando = true;

    document.getElementById("mensagem").style.display = "none";

    loop();
}


function reiniciarJogo() {

    criarJogadores();

    jogoTerminou = false;

    document.getElementById("mensagem").style.display = "none";
}


function mostrarMensagem(texto) {

    document.getElementById("tituloMensagem").textContent = texto;

    document.getElementById("mensagem").style.display = "flex";
}

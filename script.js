const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 1200;
const H = 700;

canvas.width = W;
canvas.height = H;


/* ======================================
   TECLADO
====================================== */

const keys = {};

document.addEventListener("keydown", function(e) {

    keys[e.key.toLowerCase()] = true;

    if (
        [
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
            " "
        ].includes(e.key.toLowerCase())
    ) {
        e.preventDefault();
    }
});

document.addEventListener("keyup", function(e) {

    keys[e.key.toLowerCase()] = false;
});


/* ======================================
   ESTADO DO JOGO
====================================== */

let jogoRodando = false;
let jogoTerminou = false;

let fire;
let water;


/* ======================================
   JOGADORES
====================================== */

function criarJogadores() {

    fire = {
        x: 55,
        y: 550,

        width: 34,
        height: 45,

        vx: 0,
        vy: 0,

        speed: 4.5,
        jump: -11,

        grounded: false,
        alive: true,

        color: "#ff4b32",

        tipo: "fire"
    };


    water = {
        x: 110,
        y: 550,

        width: 34,
        height: 45,

        vx: 0,
        vy: 0,

        speed: 4.5,
        jump: -11,

        grounded: false,
        alive: true,

        color: "#35aaff",

        tipo: "water"
    };
}


/* ======================================
   MAPA
====================================== */

const platforms = [

    // chão
    {
        x: 0,
        y: 620,
        w: 1200,
        h: 80
    },

    // primeira área
    {
        x: 90,
        y: 510,
        w: 230,
        h: 25
    },

    {
        x: 400,
        y: 445,
        w: 190,
        h: 25
    },

    {
        x: 690,
        y: 505,
        w: 190,
        h: 25
    },

    {
        x: 930,
        y: 425,
        w: 190,
        h: 25
    },

    // parte superior
    {
        x: 240,
        y: 345,
        w: 180,
        h: 25
    },

    {
        x: 510,
        y: 275,
        w: 190,
        h: 25
    },

    {
        x: 800,
        y: 330,
        w: 180,
        h: 25
    }
];


/* ======================================
   LAVA
====================================== */

const lava = [

    {
        x: 320,
        y: 590,
        w: 80,
        h: 30
    },

    {
        x: 590,
        y: 590,
        w: 100,
        h: 30
    },

    {
        x: 880,
        y: 590,
        w: 80,
        h: 30
    }
];


/* ======================================
   ÁGUA
====================================== */

const waterPools = [

    {
        x: 480,
        y: 580,
        w: 110,
        h: 40
    },

    {
        x: 760,
        y: 580,
        w: 120,
        h: 40
    }
];


/* ======================================
   CRISTAIS
====================================== */

const crystals = [

    {
        x: 180,
        y: 470,
        collected: false
    },

    {
        x: 455,
        y: 405,
        collected: false
    },

    {
        x: 575,
        y: 235,
        collected: false
    },

    {
        x: 850,
        y: 290,
        collected: false
    },

    {
        x: 1000,
        y: 380,
        collected: false
    }
];


/* ======================================
   PORTAS
====================================== */

const fireDoor = {
    x: 1040,
    y: 360,
    w: 45,
    h: 65
};

const waterDoor = {
    x: 1100,
    y: 360,
    w: 45,
    h: 65
};


/* ======================================
   FÍSICA
====================================== */

const gravity = 0.55;


function atualizarJogador(player) {

    if (!player.alive) {
        return;
    }


    let esquerda;
    let direita;
    let pular;


    if (player.tipo === "fire") {

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


    /* -------------------------
       MOVIMENTO HORIZONTAL
    ------------------------- */

    player.x += player.vx;


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


    /* -------------------------
       MOVIMENTO VERTICAL
    ------------------------- */

    player.y += player.vy;

    player.grounded = false;


    for (const p of platforms) {

        if (colide(player, p)) {

            if (player.vy > 0) {

                player.y = p.y - player.height;

                player.vy = 0;

                player.grounded = true;
            }

            else if (player.vy < 0) {

                player.y = p.y + p.h;

                player.vy = 0;
            }
        }
    }


    /* -------------------------
       LIMITES
    ------------------------- */

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > W) {
        player.x = W - player.width;
    }


    /* -------------------------
       QUEDA
    ------------------------- */

    if (player.y > H + 100) {

        player.alive = false;
    }


    verificarPerigos(player);

    coletarCristais(player);
}


/* ======================================
   COLISÃO
====================================== */

function colide(a, b) {

    return (
        a.x < b.x + b.w &&
        a.x + a.width > b.x &&
        a.y < b.y + b.h &&
        a.y + a.height > b.y
    );
}


/* ======================================
   PERIGOS
====================================== */

function verificarPerigos(player) {

    // Lava
    for (const l of lava) {

        if (colide(player, l)) {

            if (player.tipo === "water") {

                player.alive = false;

                return;
            }
        }
    }


    // Água
    for (const w of waterPools) {

        if (colide(player, w)) {

            if (player.tipo === "fire") {

                player.alive = false;

                return;
            }
        }
    }
}


/* ======================================
   CRISTAIS
====================================== */

function coletarCristais(player) {

    for (const crystal of crystals) {

        if (crystal.collected) {
            continue;
        }

        const c = {
            x: crystal.x - 10,
            y: crystal.y - 10,
            w: 20,
            h: 20
        };

        if (colide(player, c)) {

            crystal.collected = true;
        }
    }
}


/* ======================================
   PORTAS
====================================== */

function chegouNaPorta(player, porta) {

    return colide(player, porta);
}


/* ======================================
   VITÓRIA
====================================== */

function verificarVitoria() {

    if (!fire.alive || !water.alive) {

        jogoTerminou = true;

        mostrarMensagem(
            "💥 VOCÊS PERDERAM!"
        );

        return;
    }


    const fireChegou =
        chegouNaPorta(fire, fireDoor);

    const waterChegou =
        chegouNaPorta(water, waterDoor);


    if (fireChegou && waterChegou) {

        jogoTerminou = true;

        mostrarMensagem(
            "🎉 VOCÊS VENCERAM!"
        );
    }
}


/* ======================================
   DESENHO DO FUNDO
====================================== */

function desenharFundo() {

    const gradiente =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradiente.addColorStop(
        0,
        "#111a3d"
    );

    gradiente.addColorStop(
        1,
        "#1b102b"
    );

    ctx.fillStyle = gradiente;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* estrelas */

    ctx.fillStyle =
        "rgba(255,255,255,.5)";

    for (let i = 0; i < 90; i++) {

        const x =
            (i * 173) % W;

        const y =
            (i * 91) % 380;

        const tamanho =
            i % 4 === 0 ? 3 : 2;

        ctx.fillRect(
            x,
            y,
            tamanho,
            tamanho
        );
    }


    /* lua */

    ctx.fillStyle =
        "#e8e5ff";

    ctx.beginPath();

    ctx.arc(
        1080,
        100,
        38,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#111a3d";

    ctx.beginPath();

    ctx.arc(
        1095,
        88,
        38,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


/* ======================================
   DESENHAR PLATAFORMAS
====================================== */

function desenharPlataformas() {

    for (const p of platforms) {

        const grad =
            ctx.createLinearGradient(
                0,
                p.y,
                0,
                p.y + p.h
            );

        grad.addColorStop(
            0,
            "#7350aa"
        );

        grad.addColorStop(
            1,
            "#35234f"
        );

        ctx.fillStyle = grad;

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            p.h
        );


        ctx.fillStyle =
            "#a27bd5";

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            5
        );
    }
}


/* ======================================
   DESENHAR LAVA
====================================== */

function desenharLava() {

    for (const l of lava) {

        ctx.fillStyle =
            "#e62e22";

        ctx.fillRect(
            l.x,
            l.y,
            l.w,
            l.h
        );


        ctx.fillStyle =
            "#ff8a00";


        for (
            let x = l.x;
            x < l.x + l.w;
            x += 20
        ) {

            ctx.beginPath();

            ctx.arc(
                x + 10,
                l.y + 4,
                10,
                Math.PI,
                0
            );

            ctx.fill();
        }


        ctx.fillStyle =
            "rgba(255,220,50,.5)";

        ctx.fillRect(
            l.x,
            l.y + 20,
            l.w,
            5
        );
    }
}


/* ======================================
   DESENHAR ÁGUA
====================================== */

function desenharAgua() {

    for (const w of waterPools) {

        ctx.fillStyle =
            "#168ee5";

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );


        ctx.fillStyle =
            "#70d4ff";


        for (
            let x = w.x;
            x < w.x + w.w;
            x += 20
        ) {

            ctx.beginPath();

            ctx.arc(
                x + 10,
                w.y + 5,
                10,
                Math.PI,
                0
            );

            ctx.fill();
        }
    }
}


/* ======================================
   DESENHAR CRISTAIS
====================================== */

function desenharCristais() {

    for (const crystal of crystals) {

        if (crystal.collected) {
            continue;
        }


        ctx.save();

        ctx.translate(
            crystal.x,
            crystal.y
        );

        ctx.rotate(
            Math.PI / 4
        );


        const grad =
            ctx.createLinearGradient(
                -10,
                -10,
                10,
                10
            );

        grad.addColorStop(
            0,
            "#fff"
        );

        grad.addColorStop(
            .3,
            "#ffe65c"
        );

        grad.addColorStop(
            1,
            "#ff9d00"
        );

        ctx.fillStyle = grad;

        ctx.fillRect(
            -9,
            -9,
            18,
            18
        );


        ctx.restore();
    }
}


/* ======================================
   PORTAS
====================================== */

function desenharPorta(
    porta,
    cor,
    emoji
) {

    ctx.fillStyle =
        "#11111d";

    ctx.fillRect(
        porta.x,
        porta.y,
        porta.w,
        porta.h
    );


    ctx.strokeStyle =
        cor;

    ctx.lineWidth = 4;

    ctx.strokeRect(
        porta.x,
        porta.y,
        porta.w,
        porta.h
    );


    ctx.shadowColor = cor;
    ctx.shadowBlur = 15;

    ctx.strokeRect(
        porta.x + 5,
        porta.y + 5,
        porta.w - 10,
        porta.h - 10
    );

    ctx.shadowBlur = 0;


    ctx.font =
        "26px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        emoji,
        porta.x + porta.w / 2,
        porta.y + 42
    );
}


function desenharPortas() {

    desenharPorta(
        fireDoor,
        "#ff4b32",
        "🔥"
    );

    desenharPorta(
        waterDoor,
        "#35aaff",
        "💧"
    );
}


/* ======================================
   PERSONAGENS
====================================== */

function desenharJogador(
    player
) {

    if (!player.alive) {
        return;
    }


    ctx.save();


    ctx.translate(
        player.x + player.width / 2,
        player.y + player.height / 2
    );


    /* sombra */

    ctx.fillStyle =
        "rgba(0,0,0,.25)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        25,
        20,
        5,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* corpo */

    ctx.shadowColor =
        player.color;

    ctx.shadowBlur =
        18;

    ctx.fillStyle =
        player.color;


    ctx.beginPath();

    ctx.roundRect(
        -17,
        -23,
        34,
        45,
        10
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    /* olhos */

    ctx.fillStyle =
        "white";

    ctx.beginPath();

    ctx.arc(
        -7,
        -8,
        5,
        0,
        Math.PI * 2
    );

    ctx.arc(
        7,
        -8,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#111";

    ctx.beginPath();

    ctx.arc(
        -7,
        -8,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        7,
        -8,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* símbolo */

    ctx.font =
        "15px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        player.tipo === "fire"
            ? "🔥"
            : "💧",
        0,
        19
    );


    ctx.restore();
}


/* ======================================
   TEXTO DO JOGO
====================================== */

function desenharTexto() {

    const coletados =
        crystals.filter(
            c => c.collected
        ).length;


    ctx.fillStyle =
        "rgba(0,0,0,.45)";

    ctx.fillRect(
        20,
        20,
        190,
        42
    );


    ctx.fillStyle =
        "white";

    ctx.font =
        "bold 16px Arial";

    ctx.textAlign =
        "left";

    ctx.fillText(
        "💎 Cristais: " +
        coletados +
        "/" +
        crystals.length,
        35,
        47
    );
}


/* ======================================
   DESENHAR TUDO
====================================== */

function desenhar() {

    desenharFundo();

    desenharPlataformas();

    desenharLava();

    desenharAgua();

    desenharCristais();

    desenharPortas();

    desenharJogador(fire);

    desenharJogador(water);

    desenharTexto();
}


/* ======================================
   LOOP
====================================== */

function loop() {

    if (!jogoRodando) {
        return;
    }


    if (!jogoTerminou) {

        atualizarJogador(fire);

        atualizarJogador(water);

        verificarVitoria();
    }


    desenhar();


    requestAnimationFrame(loop);
}


/* ======================================
   INICIAR
====================================== */

function iniciarJogo() {

    document.getElementById(
        "menu"
    ).style.display = "none";


    document.getElementById(
        "game"
    ).style.display = "flex";


    criarJogadores();


    for (const crystal of crystals) {
        crystal.collected = false;
    }


    jogoTerminou = false;

    jogoRodando = true;


    document.getElementById(
        "mensagem"
    ).style.display = "none";


    loop();
}


/* ======================================
   REINICIAR
====================================== */

function reiniciarJogo() {

    criarJogadores();


    for (const crystal of crystals) {
        crystal.collected = false;
    }


    jogoTerminou = false;


    document.getElementById(
        "mensagem"
    ).style.display = "none";
}


/* ======================================
   VOLTAR AO MENU
====================================== */

function voltarMenu() {

    jogoRodando = false;

    jogoTerminou = false;


    document.getElementById(
        "game"
    ).style.display = "none";


    document.getElementById(
        "menu"
    ).style.display = "flex";
}


/* ======================================
   MENSAGEM
====================================== */

function mostrarMensagem(texto) {

    document.getElementById(
        "tituloMensagem"
    ).textContent = texto;


    const mensagem =
        document.getElementById(
            "mensagem"
        );

    mensagem.style.display = "flex";
}


/* ======================================
   COMEÇAR
====================================== */

criarJogadores();
desenhar();

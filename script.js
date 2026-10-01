const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


const W = 1200;
const H = 700;

canvas.width = W;
canvas.height = H;


/* =====================================
   TECLADO
===================================== */

const keys = {};

document.addEventListener(
    "keydown",
    function(e) {

        keys[
            e.key.toLowerCase()
        ] = true;


        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(
                e.key.toLowerCase()
            )
        ) {

            e.preventDefault();
        }
    }
);


document.addEventListener(
    "keyup",
    function(e) {

        keys[
            e.key.toLowerCase()
        ] = false;
    }
);


/* =====================================
   ESTADO
===================================== */

let jogoRodando = false;
let jogoTerminou = false;

let jogador1;
let jogador2;

let tempo = 90;
let ultimoTempo = 0;


/* =====================================
   JOGADORES
===================================== */

function criarJogadores() {

    jogador1 = {

        x: 170,
        y: 500,

        width: 38,
        height: 52,

        vx: 0,
        vy: 0,

        speed: 5,
        jump: -12,

        grounded: false,

        direction: 1,

        color: "#ff3d42",

        vida: 5,

        attack: false,
        attackTimer: 0,

        hitCooldown: 0,

        tipo: 1
    };


    jogador2 = {

        x: 990,
        y: 500,

        width: 38,
        height: 52,

        vx: 0,
        vy: 0,

        speed: 5,
        jump: -12,

        grounded: false,

        direction: -1,

        color: "#3195ff",

        vida: 5,

        attack: false,
        attackTimer: 0,

        hitCooldown: 0,

        tipo: 2
    };
}


/* =====================================
   MAPA
===================================== */

const plataformas = [

    {
        x: 0,
        y: 620,
        w: 1200,
        h: 80
    },

    {
        x: 100,
        y: 500,
        w: 250,
        h: 25
    },

    {
        x: 850,
        y: 500,
        w: 250,
        h: 25
    },

    {
        x: 390,
        y: 430,
        w: 420,
        h: 25
    },

    {
        x: 200,
        y: 310,
        w: 220,
        h: 25
    },

    {
        x: 780,
        y: 310,
        w: 220,
        h: 25
    },

    {
        x: 500,
        y: 220,
        w: 200,
        h: 25
    }
];


/* =====================================
   MOEDAS
===================================== */

const moedasBase = [

    {x: 250, y: 460},
    {x: 470, y: 390},
    {x: 600, y: 180},
    {x: 730, y: 390},
    {x: 950, y: 460}
];

let moedas = [];


/* =====================================
   PARTICULAS
===================================== */

let particulas = [];


/* =====================================
   COLISÃO
===================================== */

function colisao(a, b) {

    return (

        a.x < b.x + b.w &&

        a.x + a.width > b.x &&

        a.y < b.y + b.h &&

        a.y + a.height > b.y

    );
}


/* =====================================
   ATUALIZAR JOGADOR
===================================== */

function atualizarJogador(
    player,
    numero
) {

    if (player.vida <= 0) {
        return;
    }


    let esquerda;
    let direita;
    let pular;
    let atacar;


    if (numero === 1) {

        esquerda = keys["a"];
        direita = keys["d"];
        pular = keys["w"];
        atacar = keys["f"];

    } else {

        esquerda =
            keys["arrowleft"];

        direita =
            keys["arrowright"];

        pular =
            keys["arrowup"];

        atacar =
            keys["l"];
    }


    player.vx = 0;


    if (esquerda) {

        player.vx =
            -player.speed;

        player.direction = -1;
    }


    if (direita) {

        player.vx =
            player.speed;

        player.direction = 1;
    }


    /* pulo */

    if (
        pular &&
        player.grounded
    ) {

        player.vy =
            player.jump;

        player.grounded =
            false;
    }


    /* ataque */

    if (
        atacar &&
        player.attackTimer <= 0
    ) {

        player.attack = true;

        player.attackTimer = 25;
    }


    if (
        player.attackTimer > 0
    ) {

        player.attackTimer--;
    }

    else {

        player.attack = false;
    }


    /* gravidade */

    player.vy += .55;


    /* movimento X */

    player.x += player.vx;


    for (
        const p of plataformas
    ) {

        if (
            colisao(player, p)
        ) {

            if (
                player.vx > 0
            ) {

                player.x =
                    p.x -
                    player.width;
            }


            if (
                player.vx < 0
            ) {

                player.x =
                    p.x + p.w;
            }
        }
    }


    /* movimento Y */

    player.y += player.vy;

    player.grounded = false;


    for (
        const p of plataformas
    ) {

        if (
            colisao(player, p)
        ) {

            if (
                player.vy > 0
            ) {

                player.y =
                    p.y -
                    player.height;

                player.vy = 0;

                player.grounded =
                    true;
            }


            if (
                player.vy < 0
            ) {

                player.y =
                    p.y + p.h;

                player.vy = 0;
            }
        }
    }


    /* limites */

    if (
        player.x < 0
    ) {

        player.x = 0;
    }


    if (
        player.x +
        player.width > W
    ) {

        player.x =
            W - player.width;
    }


    /* caiu */

    if (
        player.y > H + 100
    ) {

        player.vida = 0;
    }


    if (
        player.hitCooldown > 0
    ) {

        player.hitCooldown--;
    }
}


/* =====================================
   ÁREA DE ATAQUE
===================================== */

function getAttackBox(player) {

    if (!player.attack) {
        return null;
    }


    const largura = 48;


    return {

        x:
            player.direction === 1
                ? player.x + player.width
                : player.x - largura,

        y:
            player.y + 10,

        w: largura,

        h: 30
    };
}


/* =====================================
   ATAQUE
===================================== */

function verificarAtaque(
    atacante,
    alvo
) {

    if (
        !atacante.attack
    ) {
        return;
    }


    if (
        alvo.vida <= 0
    ) {
        return;
    }


    if (
        alvo.hitCooldown > 0
    ) {
        return;
    }


    const golpe =
        getAttackBox(atacante);


    if (
        golpe &&
        colisao(golpe, alvo)
    ) {

        alvo.vida--;

        alvo.hitCooldown = 35;


        /* empurrão */

        alvo.vx =
            atacante.direction *
            9;

        alvo.vy = -5;


        criarParticulas(
            alvo.x +
            alvo.width / 2,

            alvo.y +
            alvo.height / 2,

            alvo.color
        );
    }
}


/* =====================================
   MOEDAS
===================================== */

function coletarMoedas(player) {

    for (
        const moeda of moedas
    ) {

        if (
            moeda.coletada
        ) {
            continue;
        }


        const caixa = {

            x: moeda.x - 10,
            y: moeda.y - 10,

            w: 20,
            h: 20
        };


        if (
            colisao(player, caixa)
        ) {

            moeda.coletada = true;


            criarParticulas(
                moeda.x,
                moeda.y,
                "#ffd83d"
            );
        }
    }
}


/* =====================================
   PARTICULAS
===================================== */

function criarParticulas(
    x,
    y,
    cor
) {

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        particulas.push({

            x: x,
            y: y,

            vx:
                (Math.random() - .5)
                * 7,

            vy:
                (Math.random() - .5)
                * 7,

            vida: 30,

            cor: cor
        });
    }
}


function atualizarParticulas() {

    for (
        const p of particulas
    ) {

        p.x += p.vx;

        p.y += p.vy;

        p.vy += .2;

        p.vida--;
    }


    particulas =
        particulas.filter(
            p => p.vida > 0
        );
}


/* =====================================
   TEMPO
===================================== */

function atualizarTempo() {

    const agora =
        Date.now();


    if (
        agora - ultimoTempo >= 1000
    ) {

        ultimoTempo =
            agora;

        tempo--;


        document.getElementById(
            "timer"
        ).textContent = tempo;


        if (
            tempo <= 0
        ) {

            terminarPorTempo();
        }
    }
}


/* =====================================
   FIM POR TEMPO
===================================== */

function terminarPorTempo() {

    if (jogoTerminou) {
        return;
    }


    jogoTerminou = true;


    if (
        jogador1.vida >
        jogador2.vida
    ) {

        mostrarResultado(
            "🔴 JOGADOR 1 VENCEU!",
            "O Herói Vermelho tinha mais vida."
        );

    } else if (
        jogador2.vida >
        jogador1.vida
    ) {

        mostrarResultado(
            "🔵 JOGADOR 2 VENCEU!",
            "O Herói Azul tinha mais vida."
        );

    } else {

        mostrarResultado(
            "🤝 EMPATE!",
            "Os dois terminaram com a mesma vida."
        );
    }
}


/* =====================================
   VERIFICAR VENCEDOR
===================================== */

function verificarVencedor() {

    if (
        jogador1.vida <= 0
    ) {

        jogoTerminou = true;

        mostrarResultado(
            "🔵 JOGADOR 2 VENCEU!",
            "O Herói Azul derrotou o adversário!"
        );

        return;
    }


    if (
        jogador2.vida <= 0
    ) {

        jogoTerminou = true;

        mostrarResultado(
            "🔴 JOGADOR 1 VENCEU!",
            "O Herói Vermelho derrotou o adversário!"
        );
    }
}


/* =====================================
   DESENHAR FUNDO
===================================== */

function desenharFundo() {

    const grad =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );


    grad.addColorStop(
        0,
        "#101b42"
    );


    grad.addColorStop(
        .55,
        "#221944"
    );


    grad.addColorStop(
        1,
        "#120d22"
    );


    ctx.fillStyle =
        grad;


    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* lua */

    ctx.fillStyle =
        "#fff2bd";


    ctx.beginPath();

    ctx.arc(
        1050,
        110,
        45,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* estrelas */

    ctx.fillStyle =
        "rgba(255,255,255,.65)";


    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const x =
            (i * 157) % W;

        const y =
            (i * 83) % 350;


        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }
}


/* =====================================
   PLATAFORMAS
===================================== */

function desenharPlataformas() {

    for (
        const p of plataformas
    ) {

        const grad =
            ctx.createLinearGradient(
                0,
                p.y,
                0,
                p.y + p.h
            );


        grad.addColorStop(
            0,
            "#7552a9"
        );


        grad.addColorStop(
            1,
            "#302047"
        );


        ctx.fillStyle =
            grad;


        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            p.h
        );


        /* topo */

        ctx.fillStyle =
            "#a77cda";


        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            5
        );


        /* detalhes */

        ctx.fillStyle =
            "rgba(255,255,255,.08)";


        for (
            let x = p.x + 15;
            x < p.x + p.w;
            x += 35
        ) {

            ctx.fillRect(
                x,
                p.y + 10,
                15,
                3
            );
        }
    }
}


/* =====================================
   MOEDAS
===================================== */

function desenharMoedas() {

    for (
        const moeda of moedas
    ) {

        if (
            moeda.coletada
        ) {
            continue;
        }


        ctx.save();


        ctx.shadowColor =
            "#ffd83d";

        ctx.shadowBlur = 15;


        ctx.fillStyle =
            "#ffd83d";


        ctx.beginPath();

        ctx.arc(
            moeda.x,
            moeda.y,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.shadowBlur = 0;


        ctx.fillStyle =
            "#fff2a3";


        ctx.font =
            "bold 13px Arial";

        ctx.textAlign =
            "center";


        ctx.fillText(
            "$",
            moeda.x,
            moeda.y + 5
        );


        ctx.restore();
    }
}


/* =====================================
   DESENHAR JOGADOR
===================================== */

function desenharJogador(
    player
) {

    if (
        player.vida <= 0
    ) {
        return;
    }


    ctx.save();


    /* piscar quando atingido */

    if (
        player.hitCooldown > 0 &&
        Math.floor(
            player.hitCooldown / 4
        ) % 2 === 0
    ) {

        ctx.globalAlpha = .45;
    }


    ctx.translate(
        player.x +
        player.width / 2,

        player.y +
        player.height / 2
    );


    /* direção */

    ctx.scale(
        player.direction,
        1
    );


    /* sombra */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";


    ctx.beginPath();

    ctx.ellipse(
        0,
        31,
        23,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* corpo */

    ctx.shadowColor =
        player.color;

    ctx.shadowBlur = 18;


    ctx.fillStyle =
        player.color;


    ctx.beginPath();

    ctx.roundRect(
        -19,
        -26,
        38,
        52,
        10
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    /* chapéu */

    ctx.fillStyle =
        player.tipo === 1
            ? "#c8212b"
            : "#1766c1";


    ctx.fillRect(
        -23,
        -28,
        46,
        9
    );


    ctx.beginPath();

    ctx.arc(
        0,
        -27,
        17,
        Math.PI,
        0
    );

    ctx.fill();


    /* olhos */

    ctx.fillStyle =
        "white";


    ctx.beginPath();

    ctx.arc(
        -7,
        -9,
        5,
        0,
        Math.PI * 2
    );


    ctx.arc(
        7,
        -9,
        5,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.fillStyle =
        "#111";


    ctx.beginPath();

    ctx.arc(
        -6,
        -9,
        2,
        0,
        Math.PI * 2
    );


    ctx.arc(
        8,
        -9,
        2,
        0,
        Math.PI * 2
    );


    ctx.fill();


    /* camisa */

    ctx.fillStyle =
        "#f5f5f5";


    ctx.fillRect(
        -14,
        8,
        28,
        7
    );


    /* ataque */

    if (
        player.attack
    ) {

        ctx.strokeStyle =
            "#fff";

        ctx.lineWidth = 7;

        ctx.lineCap =
            "round";


        ctx.shadowColor =
            "#ffffff";

        ctx.shadowBlur =
            12;


        ctx.beginPath();

        ctx.moveTo(
            17,
            5
        );

        ctx.lineTo(
            52,
            -12
        );

        ctx.stroke();


        /* efeito do golpe */

        ctx.strokeStyle =
            player.color;

        ctx.lineWidth = 3;


        ctx.beginPath();

        ctx.arc(
            38,
            -5,
            20,
            -.7,
            .7
        );

        ctx.stroke();
    }


    ctx.restore();
}


/* =====================================
   PARTICULAS DESENHO
===================================== */

function desenharParticulas() {

    for (
        const p of particulas
    ) {

        ctx.globalAlpha =
            p.vida / 30;


        ctx.fillStyle =
            p.cor;


        ctx.fillRect(
            p.x,
            p.y,
            5,
            5
        );
    }


    ctx.globalAlpha = 1;
}


/* =====================================
   TEXTO CENTRAL
===================================== */

function desenharTituloArena() {

    ctx.textAlign =
        "center";


    ctx.font =
        "bold 28px Arial";


    ctx.fillStyle =
        "rgba(255,255,255,.08)";


    ctx.fillText(
        "BATALHA DOS HERÓIS",
        W / 2,
        50
    );
}


/* =====================================
   DESENHAR TUDO
===================================== */

function desenhar() {

    desenharFundo();

    desenharPlataformas();

    desenharMoedas();

    desenharTituloArena();

    desenharParticulas();

    desenharJogador(
        jogador1
    );

    desenharJogador(
        jogador2
    );
}


/* =====================================
   HUD
===================================== */

function atualizarHUD() {

    const porcentagem1 =
        Math.max(
            0,
            jogador1.vida / 5 * 100
        );


    const porcentagem2 =
        Math.max(
            0,
            jogador2.vida / 5 * 100
        );


    document.getElementById(
        "vida1"
    ).style.width =
        porcentagem1 + "%";


    document.getElementById(
        "vida2"
    ).style.width =
        porcentagem2 + "%";
}


/* =====================================
   LOOP
===================================== */

function loop() {

    if (
        !jogoRodando
    ) {
        return;
    }


    if (
        !jogoTerminou
    ) {

        atualizarJogador(
            jogador1,
            1
        );


        atualizarJogador(
            jogador2,
            2
        );


        verificarAtaque(
            jogador1,
            jogador2
        );


        verificarAtaque(
            jogador2,
            jogador1
        );


        coletarMoedas(
            jogador1
        );


        coletarMoedas(
            jogador2
        );


        atualizarParticulas();


        atualizarTempo();


        verificarVencedor();


        atualizarHUD();
    }


    desenhar();


    requestAnimationFrame(
        loop
    );
}


/* =====================================
   INICIAR
===================================== */

function iniciarJogo() {

    document.getElementById(
        "menu"
    ).style.display =
        "none";


    document.getElementById(
        "game"
    ).style.display =
        "flex";


    criarJogadores();


    moedas =
        moedasBase.map(
            moeda => ({
                x: moeda.x,
                y: moeda.y,
                coletada: false
            })
        );


    particulas = [];


    tempo = 90;

    ultimoTempo =
        Date.now();


    jogoTerminou =
        false;


    jogoRodando =
        true;


    document.getElementById(
        "resultado"
    ).style.display =
        "none";


    document.getElementById(
        "timer"
    ).textContent =
        tempo;


    atualizarHUD();


    loop();
}


/* =====================================
   REINICIAR
===================================== */

function reiniciarJogo() {

    criarJogadores();


    moedas =
        moedasBase.map(
            moeda => ({
                x: moeda.x,
                y: moeda.y,
                coletada: false
            })
        );


    particulas = [];


    tempo = 90;

    ultimoTempo =
        Date.now();


    jogoTerminou =
        false;


    document.getElementById(
        "resultado"
    ).style.display =
        "none";


    atualizarHUD();


    if (!jogoRodando) {

        jogoRodando =
            true;

        loop();
    }
}


/* =====================================
   MENU
===================================== */

function voltarMenu() {

    jogoRodando =
        false;

    jogoTerminou =
        false;


    document.getElementById(
        "game"
    ).style.display =
        "none";


    document.getElementById(
        "menu"
    ).style.display =
        "flex";
}


/* =====================================
   RESULTADO
===================================== */

function mostrarResultado(
    titulo,
    texto
) {

    document.getElementById(
        "resultadoTitulo"
    ).textContent =
        titulo;


    document.getElementById(
        "resultadoTexto"
    ).textContent =
        texto;


    document.getElementById(
        "resultado"
    ).style.display =
        "flex";
}


/* =====================================
   PRIMEIRO DESENHO
===================================== */

criarJogadores();

moedas =
    moedasBase.map(
        moeda => ({
            x: moeda.x,
            y: moeda.y,
            coletada: false
        })
    );

desenhar();

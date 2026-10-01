const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;

    // Evita a página rolar quando apertar as setas
    if (
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "Space"
    ) {
        e.preventDefault();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

/* =========================
   JOGADORES
========================= */

const fire = {
    x: 80,
    y: 470,
    width: 35,
    height: 45,

    color: "#ff4b21",

    vx: 0,
    vy: 0,

    speed: 4,
    jump: -12,

    grounded: false,

    dead: false,
    finished: false
};

const water = {
    x: 140,
    y: 470,
    width: 35,
    height: 45,

    color: "#27a9ff",

    vx: 0,
    vy: 0,

    speed: 4,
    jump: -12,

    grounded: false,

    dead: false,
    finished: false
};

/* =========================
   FÍSICA
========================= */

const gravity = 0.55;

/* =========================
   PLATAFORMAS
========================= */

const platforms = [

    // chão
    {
        x: 0,
        y: 550,
        width: 1000,
        height: 50
    },

    // plataforma esquerda
    {
        x: 40,
        y: 430,
        width: 200,
        height: 25
    },

    // plataforma central
    {
        x: 300,
        y: 350,
        width: 180,
        height: 25
    },

    // plataforma alta
    {
        x: 570,
        y: 260,
        width: 180,
        height: 25
    },

    // plataforma direita
    {
        x: 790,
        y: 420,
        width: 160,
        height: 25
    },

    // parede
    {
        x: 250,
        y: 430,
        width: 25,
        height: 120
    },

    // parede
    {
        x: 500,
        y: 350,
        width: 25,
        height: 200
    },

    // parede
    {
        x: 760,
        y: 260,
        width: 25,
        height: 290
    }
];

/* =========================
   PERIGOS
========================= */

const hazards = [

    {
        x: 275,
        y: 525,
        width: 50,
        height: 25,
        type: "lava"
    },

    {
        x: 525,
        y: 525,
        width: 50,
        height: 25,
        type: "water"
    },

    {
        x: 765,
        y: 525,
        width: 30,
        height: 25,
        type: "lava"
    }
];

/* =========================
   CRISTAIS
========================= */

let crystals = [
    {
        x: 360,
        y: 315,
        collectedFire: false,
        collectedWater: false
    },

    {
        x: 630,
        y: 225,
        collectedFire: false,
        collectedWater: false
    },

    {
        x: 850,
        y: 385,
        collectedFire: false,
        collectedWater: false
    }
];

/* =========================
   PORTA
========================= */

const door = {
    x: 900,
    y: 475,
    width: 55,
    height: 75
};

/* =========================
   COLISÃO
========================= */

function collision(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/* =========================
   MOVIMENTO
========================= */

function movePlayer(player, controls) {

    player.vx = 0;

    if (keys[controls.left]) {
        player.vx = -player.speed;
    }

    if (keys[controls.right]) {
        player.vx = player.speed;
    }

    if (
        keys[controls.jump] &&
        player.grounded
    ) {
        player.vy = player.jump;
        player.grounded = false;
    }

    // Movimento horizontal
    player.x += player.vx;

    // Limites
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > WIDTH) {
        player.x = WIDTH - player.width;
    }

    // Gravidade
    player.vy += gravity;

    if (player.vy > 14) {
        player.vy = 14;
    }

    player.y += player.vy;

    player.grounded = false;

    // Colisão com plataformas
    for (const platform of platforms) {

        if (collision(player, platform)) {

            // Caindo sobre a plataforma
            if (
                player.vy >= 0 &&
                player.y + player.height - player.vy <= platform.y
            ) {

                player.y = platform.y - player.height;

                player.vy = 0;

                player.grounded = true;
            }

            // Batendo de baixo
            else if (
                player.vy < 0 &&
                player.y - player.vy >= platform.y + platform.height
            ) {

                player.y =
                    platform.y + platform.height;

                player.vy = 0;
            }

            // Colisão lateral
            else {

                if (player.vx > 0) {
                    player.x = platform.x - player.width;
                }

                if (player.vx < 0) {
                    player.x =
                        platform.x + platform.width;
                }
            }
        }
    }
}

/* =========================
   PERIGOS
========================= */

function checkHazards(player) {

    for (const hazard of hazards) {

        if (collision(player, hazard)) {

            player.dead = true;
        }
    }

    // Queda
    if (player.y > HEIGHT + 50) {
        player.dead = true;
    }
}

/* =========================
   CRISTAIS
========================= */

function collectCrystals(player, type) {

    for (const crystal of crystals) {

        const item = {
            x: crystal.x,
            y: crystal.y,
            width: 25,
            height: 25
        };

        if (collision(player, item)) {

            if (type === "fire") {
                crystal.collectedFire = true;
            }

            if (type === "water") {
                crystal.collectedWater = true;
            }
        }
    }
}

/* =========================
   PORTA
========================= */

function checkDoor(player) {

    if (collision(player, door)) {

        // Jogador só entra se estiver na porta
        player.finished = true;
    }
}

/* =========================
   DESENHAR JOGADOR
========================= */

function drawPlayer(player, emoji) {

    ctx.save();

    // sombra
    ctx.fillStyle = "rgba(0,0,0,0.25)";

    ctx.beginPath();

    ctx.ellipse(
        player.x + player.width / 2,
        player.y + player.height,
        20,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // corpo
    ctx.fillStyle = player.color;

    ctx.roundRect(
        player.x,
        player.y,
        player.width,
        player.height,
        10
    );

    ctx.fill();

    // emoji
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        emoji,
        player.x + player.width / 2,
        player.y + player.height / 2
    );

    ctx.restore();
}

/* =========================
   DESENHAR PLATAFORMAS
========================= */

function drawPlatforms() {

    for (const p of platforms) {

        const gradient =
            ctx.createLinearGradient(
                0,
                p.y,
                0,
                p.y + p.height
            );

        gradient.addColorStop(0, "#6675c9");
        gradient.addColorStop(1, "#303966");

        ctx.fillStyle = gradient;

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );

        // borda
        ctx.strokeStyle = "#8996e5";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            p.x,
            p.y,
            p.width,
            p.height
        );
    }
}

/* =========================
   DESENHAR PERIGOS
========================= */

function drawHazards() {

    for (const h of hazards) {

        if (h.type === "lava") {
            ctx.fillStyle = "#ff3b20";
        } else {
            ctx.fillStyle = "#168dff";
        }

        ctx.fillRect(
            h.x,
            h.y,
            h.width,
            h.height
        );

        // brilho
        ctx.fillStyle =
            "rgba(255,255,255,0.35)";

        ctx.fillRect(
            h.x,
            h.y,
            h.width,
            5
        );
    }
}

/* =========================
   DESENHAR CRISTAIS
========================= */

function drawCrystals() {

    for (const crystal of crystals) {

        // Só desaparece quando os dois coletarem
        if (
            crystal.collectedFire &&
            crystal.collectedWater
        ) {
            continue;
        }

        ctx.save();

        ctx.translate(
            crystal.x + 12,
            crystal.y + 12
        );

        ctx.rotate(Math.PI / 4);

        ctx.fillStyle = "#ffe44d";

        ctx.fillRect(
            -10,
            -10,
            20,
            20
        );

        ctx.restore();
    }
}

/* =========================
   DESENHAR PORTA
========================= */

function drawDoor() {

    ctx.fillStyle = "#7b4cff";

    ctx.fillRect(
        door.x,
        door.y,
        door.width,
        door.height
    );

    ctx.fillStyle = "#d8c7ff";

    ctx.beginPath();

    ctx.arc(
        door.x + door.width / 2,
        door.y + 35,
        14,
        Math.PI,
        0
    );

    ctx.fill();

    ctx.fillStyle = "#ffd84d";

    ctx.beginPath();

    ctx.arc(
        door.x + 42,
        door.y + 42,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";

    ctx.fillText(
        "SAÍDA",
        door.x - 5,
        door.y - 8
    );
}

/* =========================
   DESENHAR FUNDO
========================= */

function drawBackground() {

    // estrelas
    ctx.fillStyle = "#ffffff";

    const stars = [
        [50, 60],
        [150, 120],
        [250, 70],
        [400, 100],
        [550, 50],
        [700, 110],
        [850, 60],
        [940, 140]
    ];

    for (const star of stars) {

        ctx.beginPath();

        ctx.arc(
            star[0],
            star[1],
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

/* =========================
   RESET
========================= */

function resetGame() {

    fire.x = 80;
    fire.y = 470;
    fire.vx = 0;
    fire.vy = 0;
    fire.dead = false;
    fire.finished = false;

    water.x = 140;
    water.y = 470;
    water.vx = 0;
    water.vy = 0;
    water.dead = false;
    water.finished = false;

    crystals = [
        {
            x: 360,
            y: 315,
            collectedFire: false,
            collectedWater: false
        },

        {
            x: 630,
            y: 225,
            collectedFire: false,
            collectedWater: false
        },

        {
            x: 850,
            y: 385,
            collectedFire: false,
            collectedWater: false
        }
    ];
}

document
    .getElementById("restart")
    .addEventListener("click", resetGame);

/* =========================
   BOTÕES MOBILE
========================= */

document
    .querySelectorAll("[data-key]")
    .forEach(button => {

        const key = button.dataset.key;

        button.addEventListener("pointerdown", () => {
            keys[key] = true;
        });

        button.addEventListener("pointerup", () => {
            keys[key] = false;
        });

        button.addEventListener("pointerleave", () => {
            keys[key] = false;
        });

        button.addEventListener("pointercancel", () => {
            keys[key] = false;
        });
    });

/* =========================
   ATUALIZAÇÃO
========================= */

function update() {

    if (
        fire.dead ||
        water.dead
    ) {
        return;
    }

    if (!fire.finished) {

        movePlayer(fire, {
            left: "KeyA",
            right: "KeyD",
            jump: "KeyW"
        });

        checkHazards(fire);

        collectCrystals(fire, "fire");

        checkDoor(fire);
    }

    if (!water.finished) {

        movePlayer(water, {
            left: "ArrowLeft",
            right: "ArrowRight",
            jump: "ArrowUp"
        });

        checkHazards(water);

        collectCrystals(water, "water");

        checkDoor(water);
    }
}

/* =========================
   DESENHAR
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

    drawBackground();

    drawPlatforms();

    drawHazards();

    drawCrystals();

    drawDoor();

    if (!fire.dead) {
        drawPlayer(fire, "🔥");
    }

    if (!water.dead) {
        drawPlayer(water, "💧");
    }

    // Vitória
    if (
        fire.finished &&
        water.finished
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,0.75)";

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );

        ctx.fillStyle = "#fff";

        ctx.font = "bold 52px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "🎉 FASE COMPLETA!",
            WIDTH / 2,
            HEIGHT / 2
        );

        ctx.font = "24px Arial";

        ctx.fillText(
            "Os dois chegaram à saída!",
            WIDTH / 2,
            HEIGHT / 2 + 50
        );
    }

    // Derrota
    if (
        fire.dead ||
        water.dead
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,0.75)";

        ctx.fillRect(
            0,
            0,
            WIDTH,
            HEIGHT
        );

        ctx.fillStyle = "#ff5555";

        ctx.font = "bold 50px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "💥 VOCÊ PERDEU!",
            WIDTH / 2,
            HEIGHT / 2
        );

        ctx.fillStyle = "#fff";

        ctx.font = "22px Arial";

        ctx.fillText(
            "Clique em Reiniciar para tentar novamente",
            WIDTH / 2,
            HEIGHT / 2 + 50
        );
    }
}

/* =========================
   LOOP
========================= */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
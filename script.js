const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const levelText = document.getElementById("levelText");
const message = document.getElementById("message");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const gravity = 0.55;

const keys = {};

let currentLevel = 0;

let gameState = "playing";

let transitionTimer = 0;


/* =====================================================
   CONTROLES
===================================================== */

document.addEventListener("keydown", (event) => {

    keys[event.code] = true;

    if (
        [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Space"
        ].includes(event.code)
    ) {
        event.preventDefault();
    }

});

document.addEventListener("keyup", (event) => {

    keys[event.code] = false;

});


/* =====================================================
   JOGADORES
===================================================== */

const fire = {

    x: 70,
    y: 450,

    width: 34,
    height: 44,

    color: "#ff4a21",

    vx: 0,
    vy: 0,

    speed: 4,
    jump: -12,

    grounded: false,

    finished: false,
    dead: false

};


const water = {

    x: 125,
    y: 450,

    width: 34,
    height: 44,

    color: "#249cff",

    vx: 0,
    vy: 0,

    speed: 4,
    jump: -12,

    grounded: false,

    finished: false,
    dead: false

};


/* =====================================================
   FASES
===================================================== */

const levels = [

    /* ================= FASE 1 ================= */

    {

        platforms: [

            { x: 0, y: 550, width: 1000, height: 50 },

            { x: 40, y: 430, width: 210, height: 25 },

            { x: 320, y: 360, width: 170, height: 25 },

            { x: 560, y: 280, width: 180, height: 25 },

            { x: 790, y: 420, width: 160, height: 25 }

        ],

        hazards: [

            {
                x: 250,
                y: 525,
                width: 70,
                height: 25,
                type: "lava"
            },

            {
                x: 490,
                y: 525,
                width: 70,
                height: 25,
                type: "water"
            }

        ],

        door: {
            x: 890,
            y: 475,
            width: 55,
            height: 75
        },

        crystals: [

            { x: 390, y: 325 },

            { x: 635, y: 245 }

        ]

    },


    /* ================= FASE 2 ================= */

    {

        platforms: [

            { x: 0, y: 550, width: 1000, height: 50 },

            { x: 30, y: 450, width: 150, height: 25 },

            { x: 230, y: 380, width: 150, height: 25 },

            { x: 430, y: 300, width: 150, height: 25 },

            { x: 650, y: 380, width: 150, height: 25 },

            { x: 840, y: 300, width: 120, height: 25 }

        ],

        hazards: [

            {
                x: 180,
                y: 525,
                width: 50,
                height: 25,
                type: "lava"
            },

            {
                x: 380,
                y: 525,
                width: 50,
                height: 25,
                type: "water"
            },

            {
                x: 580,
                y: 525,
                width: 70,
                height: 25,
                type: "lava"
            },

            {
                x: 800,
                y: 525,
                width: 40,
                height: 25,
                type: "water"
            }

        ],

        door: {
            x: 890,
            y: 225,
            width: 55,
            height: 75
        },

        crystals: [

            { x: 270, y: 345 },

            { x: 475, y: 265 },

            { x: 700, y: 345 }

        ]

    },


    /* ================= FASE 3 ================= */

    {

        platforms: [

            { x: 0, y: 550, width: 1000, height: 50 },

            { x: 40, y: 430, width: 180, height: 25 },

            { x: 280, y: 330, width: 140, height: 25 },

            { x: 470, y: 430, width: 150, height: 25 },

            { x: 670, y: 300, width: 140, height: 25 },

            { x: 850, y: 400, width: 120, height: 25 }

        ],

        hazards: [

            {
                x: 220,
                y: 525,
                width: 60,
                height: 25,
                type: "lava"
            },

            {
                x: 420,
                y: 525,
                width: 50,
                height: 25,
                type: "water"
            },

            {
                x: 620,
                y: 525,
                width: 50,
                height: 25,
                type: "lava"
            },

            {
                x: 810,
                y: 525,
                width: 40,
                height: 25,
                type: "water"
            }

        ],

        door: {
            x: 905,
            y: 325,
            width: 55,
            height: 75
        },

        crystals: [

            { x: 320, y: 295 },

            { x: 515, y: 395 },

            { x: 710, y: 265 },

            { x: 885, y: 365 }

        ]

    }

];


/* =====================================================
   FASE ATUAL
===================================================== */

let level;


/* =====================================================
   INICIAR FASE
===================================================== */

function loadLevel(number) {

    currentLevel = number;

    level = levels[currentLevel];

    fire.x = 70;
    fire.y = 480;

    fire.vx = 0;
    fire.vy = 0;

    fire.dead = false;
    fire.finished = false;


    water.x = 125;
    water.y = 480;

    water.vx = 0;
    water.vy = 0;

    water.dead = false;
    water.finished = false;


    // Clona os cristais para poder coletá-los
    level.crystals = level.crystals.map(crystal => ({

        x: crystal.x,
        y: crystal.y,

        fire: false,
        water: false

    }));


    gameState = "playing";

    message.textContent = "";

    levelText.textContent =
        `Fase ${currentLevel + 1} / ${levels.length}`;

}


/* =====================================================
   COLISÃO
===================================================== */

function intersects(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );

}


/* =====================================================
   MOVIMENTO
===================================================== */

function movePlayer(player, controls) {

    player.vx = 0;


    if (keys[controls.left]) {

        player.vx = -player.speed;

    }


    if (keys[controls.right]) {

        player.vx = player.speed;

    }


    // Pulo
    if (
        keys[controls.jump] &&
        player.grounded
    ) {

        player.vy = player.jump;

        player.grounded = false;

    }


    // Movimento horizontal
    player.x += player.vx;


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


    // Plataformas
    for (const platform of level.platforms) {

        if (!intersects(player, platform)) {

            continue;

        }


        // Caindo em cima
        if (
            player.vy >= 0 &&
            player.y + player.height - player.vy <= platform.y
        ) {

            player.y =
                platform.y - player.height;

            player.vy = 0;

            player.grounded = true;

        }


        // Batendo por baixo
        else if (
            player.vy < 0 &&
            player.y - player.vy >=
            platform.y + platform.height
        ) {

            player.y =
                platform.y + platform.height;

            player.vy = 0;

        }


        // Colisão lateral
        else {

            if (player.vx > 0) {

                player.x =
                    platform.x - player.width;

            }

            if (player.vx < 0) {

                player.x =
                    platform.x + platform.width;

            }

        }

    }

}


/* =====================================================
   PERIGOS
===================================================== */

function checkHazards(player) {

    for (const hazard of level.hazards) {

        if (intersects(player, hazard)) {

            player.dead = true;

            return;

        }

    }


    // Caiu fora do mapa
    if (player.y > HEIGHT + 100) {

        player.dead = true;

    }

}


/* =====================================================
   CRISTAIS
===================================================== */

function collectCrystals(player, type) {

    for (const crystal of level.crystals) {

        const item = {

            x: crystal.x - 12,
            y: crystal.y - 12,

            width: 24,
            height: 24

        };


        if (!intersects(player, item)) {

            continue;

        }


        if (type === "fire") {

            crystal.fire = true;

        }


        if (type === "water") {

            crystal.water = true;

        }

    }

}


/* =====================================================
   PORTA
===================================================== */

function checkDoor(player) {

    if (intersects(player, level.door)) {

        player.finished = true;

    }

}


/* =====================================================
   ATUALIZAR
===================================================== */

function update() {

    if (gameState !== "playing") {

        return;

    }


    // FOGO
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


    // ÁGUA
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


    // MORTE
    if (fire.dead || water.dead) {

        gameState = "dead";

        message.textContent =
            "💥 Um jogador morreu! Reinicie a fase.";

        return;

    }


    // Os dois chegaram
    if (
        fire.finished &&
        water.finished
    ) {

        gameState = "transition";

        transitionTimer = 100;

    }

}


/* =====================================================
   DESENHAR FUNDO
===================================================== */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            HEIGHT
        );


    gradient.addColorStop(
        0,
        "#17204a"
    );


    gradient.addColorStop(
        1,
        "#090c1d"
    );


    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    // estrelas
    ctx.fillStyle =
        "rgba(255,255,255,0.7)";


    const stars = [

        [50, 70],
        [130, 120],
        [220, 50],
        [350, 100],
        [460, 65],
        [570, 110],
        [690, 55],
        [820, 120],
        [930, 65]

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


/* =====================================================
   DESENHAR PLATAFORMAS
===================================================== */

function drawPlatforms() {

    for (const p of level.platforms) {

        const gradient =
            ctx.createLinearGradient(
                0,
                p.y,
                0,
                p.y +
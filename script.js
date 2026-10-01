const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const restartButton = document.getElementById("restartButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;


/* =================================
   TECLADO
================================= */

const keys = {};

window.addEventListener("keydown", function (event) {

    const key = event.key.toLowerCase();

    keys[key] = true;

    if (
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === " "
    ) {
        event.preventDefault();
    }

    if (key === "r") {
        restartGame();
    }
});


window.addEventListener("keyup", function (event) {

    keys[event.key.toLowerCase()] = false;

});


/* =================================
   CONFIGURAÇÃO
================================= */

const gravity = 0.45;

const playerSpeed = 3.5;

const jumpPower = -10;


/* =================================
   JOGADORES
================================= */

let fire;
let water;


function createPlayer(type, x, y) {

    return {

        type: type,

        x: x,
        y: y,

        width: 28,
        height: 38,

        velocityX: 0,
        velocityY: 0,

        speed: playerSpeed,

        jump: jumpPower,

        grounded: false,

        hasGem: false,

        finished: false
    };
}


/* =================================
   PLATAFORMAS
================================= */

const platforms = [

    // chão
    {
        x: 0,
        y: 490,
        width: 960,
        height: 50
    },

    // esquerda
    {
        x: 20,
        y: 400,
        width: 220,
        height: 20
    },

    // centro
    {
        x: 300,
        y: 420,
        width: 180,
        height: 20
    },

    // superior esquerda
    {
        x: 80,
        y: 300,
        width: 180,
        height: 20
    },

    // superior centro
    {
        x: 370,
        y: 280,
        width: 200,
        height: 20
    },

    // direita
    {
        x: 650,
        y: 390,
        width: 250,
        height: 20
    },

    // superior direita
    {
        x: 700,
        y: 250,
        width: 180,
        height: 20
    },

    // plataforma alta
    {
        x: 480,
        y: 140,
        width: 180,
        height: 20
    },

    // plataforma esquerda alta
    {
        x: 40,
        y: 170,
        width: 180,
        height: 20
    }
];


/* =================================
   PERIGOS
================================= */

const hazards = [

    {
        type: "water",
        x: 240,
        y: 470,
        width: 100,
        height: 20
    },

    {
        type: "water",
        x: 560,
        y: 470,
        width: 130,
        height: 20
    },

    {
        type: "fire",
        x: 470,
        y: 470,
        width: 90,
        height: 20
    },

    {
        type: "fire",
        x: 850,
        y: 470,
        width: 110,
        height: 20
    }
];


/* =================================
   GEMAS
================================= */

let gems;


function createGems() {

    return [

        {
            type: "fire",

            x: 160,
            y: 270,

            collected: false
        },

        {
            type: "water",

            x: 780,
            y: 220,

            collected: false
        }

    ];
}


/* =================================
   PORTAS
================================= */

const doors = [

    {
        type: "fire",

        x: 30,
        y: 350,

        width: 45,
        height: 50
    },

    {
        type: "water",

        x: 885,
        y: 340,

        width: 45,
        height: 50
    }

];


/* =================================
   ESTADO DO JOGO
================================= */

let gameWon = false;


/* =================================
   REINICIAR
================================= */

function restartGame() {

    fire = createPlayer(
        "fire",
        80,
        350
    );

    water = createPlayer(
        "water",
        120,
        350
    );

    gems = createGems();

    gameWon = false;
}


restartButton.addEventListener(
    "click",
    restartGame
);

restartGame();


/* =================================
   COLISÃO
================================= */

function isColliding(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );
}


/* =================================
   MOVIMENTO HORIZONTAL
================================= */

function moveHorizontal(player) {

    player.x += player.velocityX;


    for (const platform of platforms) {

        if (isColliding(player, platform)) {

            if (player.velocityX > 0) {

                player.x =
                    platform.x - player.width;

            }

            else if (player.velocityX < 0) {

                player.x =
                    platform.x + platform.width;

            }

        }

    }


    if (player.x < 0) {

        player.x = 0;

    }


    if (player.x + player.width > WIDTH) {

        player.x =
            WIDTH - player.width;

    }

}


/* =================================
   MOVIMENTO VERTICAL
================================= */

function moveVertical(player) {

    player.velocityY += gravity;

    player.y += player.velocityY;

    player.grounded = false;


    for (const platform of platforms) {

        if (isColliding(player, platform)) {

            if (player.velocityY > 0) {

                player.y =
                    platform.y - player.height;

                player.velocityY = 0;

                player.grounded = true;

            }

            else if (player.velocityY < 0) {

                player.y =
                    platform.y + platform.height;

                player.velocityY = 0;

            }

        }

    }


    // caiu do mapa

    if (player.y > HEIGHT + 100) {

        resetPlayer(player);

    }

}


/* =================================
   RESET DO JOGADOR
================================= */

function resetPlayer(player) {

    if (player.type === "fire") {

        player.x = 80;
        player.y = 350;

    }

    else {

        player.x = 120;
        player.y = 350;

    }

    player.velocityX = 0;
    player.velocityY = 0;
}


/* =================================
   CONTROLE DO FOGO
================================= */

function controlFire() {

    fire.velocityX = 0;


    if (keys["a"]) {

        fire.velocityX =
            -fire.speed;

    }


    if (keys["d"]) {

        fire.velocityX =
            fire.speed;

    }


    if (
        keys["w"] &&
        fire.grounded
    ) {

        fire.velocityY =
            fire.jump;

    }

}


/* =================================
   CONTROLE DA ÁGUA
================================= */

function controlWater() {

    water.velocityX = 0;


    if (keys["arrowleft"]) {

        water.velocityX =
            -water.speed;

    }


    if (keys["arrowright"]) {

        water.velocityX =
            water.speed;

    }


    if (
        keys["arrowup"] &&
        water.grounded
    ) {

        water.velocityY =
            water.jump;

    }

}


/* =================================
   PERIGOS
================================= */

function checkHazards(player) {

    for (const hazard of hazards) {

        if (isColliding(player, hazard)) {

            // Cada personagem morre
            // ao tocar no elemento contrário.

            if (player.type !== hazard.type) {

                resetPlayer(player);

                return;

            }

        }

    }

}


/* =================================
   GEMAS
================================= */

function checkGems(player) {

    for (const gem of gems) {

        if (gem.collected) {
            continue;
        }


        const gemBox = {

            x: gem.x - 12,

            y: gem.y - 12,

            width: 24,

            height: 24

        };


        if (

            gem.type === player.type &&

            isColliding(player, gemBox)

        ) {

            gem.collected = true;

            player.hasGem = true;

        }

    }

}


/* =================================
   PORTAS
================================= */

function checkDoors(player) {

    for (const door of doors) {

        if (

            door.type === player.type &&

            player.hasGem &&

            isColliding(player, door)

        ) {

            player.finished = true;

        }

    }

}


/* =================================
   ATUALIZAR JOGO
================================= */

function update() {

    if (gameWon) {
        return;
    }


    controlFire();

    controlWater();


    moveHorizontal(fire);

    moveVertical(fire);


    moveHorizontal(water);

    moveVertical(water);


    checkHazards(fire);

    checkHazards(water);


    checkGems(fire);

    checkGems(water);


    checkDoors(fire);

    checkDoors(water);


    if (
        fire.finished &&
        water.finished
    ) {

        gameWon = true;

    }

}


/* =================================
   FUNDO
================================= */

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
        "#18254a"
    );

    gradient.addColorStop(
        1,
        "#080d1d"
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
        "rgba(255,255,255,.5)";


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const x =
            (i * 137) % WIDTH;

        const y =
            (i * 73) % 230;


        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }

}


/* =================================
   PLATAFORMAS
================================= */

function drawPlatforms() {

    for (const platform of platforms) {

        const gradient =
            ctx.createLinearGradient(
                0,
                platform.y,
                0,
                platform.y + platform.height
            );


        gradient.addColorStop(
            0,
            "#7189ba"
        );

        gradient.addColorStop(
            1,
            "#26395f"
        );


        ctx.fillStyle = gradient;


        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );


        ctx.fillStyle =
            "#9db6e4";


        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            4
        );

    }

}


/* =================================
   PERIGOS
================================= */

function drawHazards() {

    for (const hazard of hazards) {

        if (hazard.type === "water") {

            const gradient =
                ctx.createLinearGradient(
                    0,
                    hazard.y,
                    0,
                    hazard.y + hazard.height
                );


            gradient.addColorStop(
                0,
                "#29ddff"
            );

            gradient.addColorStop(
                1,
                "#0755c7"
            );


            ctx.fillStyle = gradient;

        }

        else {

            const gradient =
                ctx.createLinearGradient(
                    0,
                    hazard.y,
                    0,
                    hazard.y + hazard.height
                );


            gradient.addColorStop(
                0,
                "#ffdf22"
            );

            gradient.addColorStop(
                0.5,
                "#ff4b18"
            );

            gradient.addColorStop(
                1,
                "#b30000"
            );


            ctx.fillStyle = gradient;

        }


        ctx.fillRect(
            hazard.x,
            hazard.y,
            hazard.width,
            hazard.height
        );


        // bolhas/chamas

        ctx.fillStyle =
            "rgba(255,255,255,.45)";


        for (
            let x = hazard.x + 8;
            x < hazard.x + hazard.width;
            x += 25
        ) {

            ctx.beginPath();

            ctx.arc(
                x,
                hazard.y + 7,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }

}


/* =================================
   PORTAS
================================= */

function drawDoors() {

    for (const door of doors) {

        if (door.type === "fire") {

            ctx.fillStyle =
                "#a83220";

        }

        else {

            ctx.fillStyle =
                "#1269a6";

        }


        ctx.fillRect(
            door.x,
            door.y,
            door.width,
            door.height
        );


        if (door.type === "fire") {

            ctx.fillStyle =
                "#ff633e";

        }

        else {

            ctx.fillStyle =
                "#48dfff";

        }


        ctx.fillRect(
            door.x + 7,
            door.y + 7,
            door.width - 14,
            door.height - 7
        );


        // maçaneta

        ctx.fillStyle = "#fff";

        ctx.beginPath();

        ctx.arc(
            door.x + door.width - 10,
            door.y + door.height / 2,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


/* =================================
   GEMAS
================================= */

function drawGems() {

    for (const gem of gems) {

        if (gem.collected) {
            continue;
        }


        ctx.save();


        ctx.translate(
            gem.x,
            gem.y
        );


        ctx.rotate(
            Math.PI / 4
        );


        if (gem.type === "fire") {

            ctx.shadowColor =
                "#ff4a21";

            ctx.fillStyle =
                "#ff4928";

        }

        else {

            ctx.shadowColor =
                "#25d9ff";

            ctx.fillStyle =
                "#25cfff";

        }


        ctx.shadowBlur = 20;


        ctx.fillRect(
            -9,
            -9,
            18,
            18
        );


        ctx.restore();

    }


    ctx.shadowBlur = 0;

}


/* =================================
   JOGADORES
================================= */

function drawPlayer(player) {

    let color;
    let glow;


    if (player.type === "fire") {

        color = "#ff4b26";

        glow = "#ff2400";

    }

    else {

        color = "#22cfff";

        glow = "#009dff";

    }


    ctx.save();


    ctx.shadowColor = glow;

    ctx.shadowBlur = 15;


    ctx.fillStyle = color;


    // corpo

    ctx.beginPath();

    ctx.roundRect(
        player.x,
        player.y,
        player.width,
        player.height,
        8
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    // olhos

    ctx.fillStyle = "#fff";


    ctx.fillRect(
        player.x + 6,
        player.y + 8,
        5,
        7
    );


    ctx.fillRect(
        player.x + 17,
        player.y + 8,
        5,
        7
    );


    ctx.fillStyle = "#111";


    ctx.fillRect(
        player.x + 8,
        player.y + 10,
        2,
        4
    );


    ctx.fillRect(
        player.x + 19,
        player.y + 10,
        2,
        4
    );


    // sorriso

    ctx.strokeStyle = "#111";

    ctx.lineWidth = 2;


    ctx.beginPath();

    ctx.arc(
        player.x + player.width / 2,
        player.y + 18,
        7,
        0.1,
        Math.PI - 0.1
    );

    ctx.stroke();


    // gema acima do jogador

    if (player.hasGem) {

        ctx.fillStyle =
            "#ffe44c";

        ctx.shadowColor =
            "#ffe44c";

        ctx.shadowBlur = 12;


        ctx.beginPath();

        ctx.arc(
            player.x + player.width / 2,
            player.y - 8,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.restore();

}


/* =================================
   STATUS
================================= */

function drawStatus() {

    ctx.font =
        "bold 17px Arial";


    ctx.textAlign =
        "left";


    ctx.fillStyle =
        "#fff";


    ctx.fillText(

        "🔥 " +
        (
            fire.hasGem
                ? "Gema ✓"
                : "Pegue a gema"
        ),

        20,
        30

    );


    ctx.textAlign =
        "right";


    ctx.fillText(

        "💧 " +
        (
            water.hasGem
                ? "Gema ✓"
                : "Pegue a gema"
        ),

        WIDTH - 20,
        30

    );


    ctx.textAlign =
        "center";

}


/* =================================
   VITÓRIA
================================= */

function drawWinScreen() {

    if (!gameWon) {
        return;
    }


    ctx.fillStyle =
        "rgba(0,0,0,.75)";


    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    ctx.textAlign =
        "center";


    ctx.shadowColor =
        "#00eaff";

    ctx.shadowBlur = 20;


    ctx.fillStyle =
        "#fff";


    ctx.font =
        "bold 48px Arial";


    ctx.fillText(
        "🎉 VOCÊS VENCERAM!",
        WIDTH / 2,
        HEIGHT / 2 - 30
    );


    ctx.shadowBlur = 0;


    ctx.font =
        "22px Arial";


    ctx.fillStyle =
        "#d5eaff";


    ctx.fillText(
        "Fogo e Água chegaram às suas portas!",
        WIDTH / 2,
        HEIGHT / 2 + 15
    );


    ctx.font =
        "18px Arial";


    ctx.fillText(
        "Pressione R para jogar novamente",
        WIDTH / 2,
        HEIGHT / 2 + 55
    );

}


/* =================================
   LOOP DO JOGO
================================= */

function gameLoop() {

    update();

    drawBackground();

    drawPlatforms();

    drawHazards();

    drawDoors();

    drawGems();

    drawPlayer(fire);

    drawPlayer(water);

    drawStatus();

    drawWinScreen();


    requestAnimationFrame(gameLoop);

}


gameLoop();

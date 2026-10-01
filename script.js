const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const screen = document.getElementById("screen");
const playButton = document.getElementById("play");

const keys = {};

let gameRunning = false;
let gameWon = false;


// =====================================================
// TECLADO
// =====================================================

document.addEventListener("keydown", function (event) {

    keys[event.key.toLowerCase()] = true;

    if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
    ) {
        event.preventDefault();
    }

});

document.addEventListener("keyup", function (event) {

    keys[event.key.toLowerCase()] = false;

});


// =====================================================
// JOGADORES
// =====================================================

const fire = {

    x: 70,
    y: 500,

    width: 30,
    height: 40,

    speed: 4,

    velocityY: 0,

    jumpPower: -12,

    grounded: false

};


const water = {

    x: 120,
    y: 500,

    width: 30,
    height: 40,

    speed: 4,

    velocityY: 0,

    jumpPower: -12,

    grounded: false

};


// =====================================================
// MAPA
// =====================================================

const platforms = [

    // chão
    {
        x: 0,
        y: 560,
        width: 1000,
        height: 40
    },

    // plataformas
    {
        x: 50,
        y: 470,
        width: 190,
        height: 20
    },

    {
        x: 310,
        y: 410,
        width: 180,
        height: 20
    },

    {
        x: 560,
        y: 470,
        width: 170,
        height: 20
    },

    {
        x: 790,
        y: 390,
        width: 160,
        height: 20
    },

    {
        x: 110,
        y: 320,
        width: 180,
        height: 20
    },

    {
        x: 400,
        y: 270,
        width: 180,
        height: 20
    },

    {
        x: 680,
        y: 220,
        width: 190,
        height: 20
    },

    {
        x: 850,
        y: 120,
        width: 120,
        height: 20
    }

];


// =====================================================
// LAVA
// =====================================================

const lava = [

    {
        x: 240,
        y: 540,
        width: 120,
        height: 20
    },

    {
        x: 700,
        y: 540,
        width: 140,
        height: 20
    }

];


// =====================================================
// ÁGUA
// =====================================================

const water = [

    {
        x: 360,
        y: 540,
        width: 120,
        height: 20
    },

    {
        x: 840,
        y: 540,
        width: 120,
        height: 20
    }

];


// =====================================================
// PORTAS
// =====================================================

const fireDoor = {

    x: 870,
    y: 65,

    width: 35,
    height: 55

};


const waterDoor = {

    x: 920,
    y: 65,

    width: 35,
    height: 55

};


// =====================================================
// COLISÃO
// =====================================================

function collision(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );

}


// =====================================================
// MOVIMENTO
// =====================================================

function updatePlayer(player, controls) {

    const oldY = player.y;


    // -----------------------------------------
    // MOVIMENTO HORIZONTAL
    // -----------------------------------------

    if (keys[controls.left]) {

        player.x -= player.speed;

    }

    if (keys[controls.right]) {

        player.x += player.speed;

    }


    // limites

    if (player.x < 0) {

        player.x = 0;

    }

    if (player.x + player.width > canvas.width) {

        player.x =
            canvas.width - player.width;

    }


    // -----------------------------------------
    // PULO
    // -----------------------------------------

    if (
        keys[controls.jump] &&
        player.grounded
    ) {

        player.velocityY =
            player.jumpPower;

        player.grounded = false;

    }


    // -----------------------------------------
    // GRAVIDADE
    // -----------------------------------------

    player.velocityY += 0.6;

    if (player.velocityY > 12) {

        player.velocityY = 12;

    }

    player.y += player.velocityY;


    // -----------------------------------------
    // COLISÃO COM PLATAFORMAS
    // -----------------------------------------

    player.grounded = false;

    for (const platform of platforms) {

        const horizontal =
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width;

        const falling =
            player.velocityY >= 0;

        const crossed =
            oldY + player.height <= platform.y &&
            player.y + player.height >= platform.y;

        if (
            horizontal &&
            falling &&
            crossed
        ) {

            player.y =
                platform.y - player.height;

            player.velocityY = 0;

            player.grounded = true;

        }

    }


    // -----------------------------------------
    // CAIR
    // -----------------------------------------

    if (player.y > canvas.height + 50) {

        resetPlayer(player);

    }

}


// =====================================================
// RESET
// =====================================================

function resetPlayer(player) {

    player.velocityY = 0;

    player.grounded = false;

    if (player === fire) {

        player.x = 70;
        player.y = 500;

    } else {

        player.x = 120;
        player.y = 500;

    }

}


// =====================================================
// PERIGOS
// =====================================================

function checkHazards() {

    // Fogo não pode tocar na água

    for (const pool of water) {

        if (collision(fire, pool)) {

            resetPlayer(fire);

        }

    }


    // Água não pode tocar na lava

    for (const pool of lava) {

        if (collision(water, pool)) {

            resetPlayer(water);

        }

    }


    // Qualquer personagem que cair na lava/água errada

    for (const pool of lava) {

        if (collision(fire, pool)) {

            // fogo pode ficar na lava
            // então não faz nada

        }

    }


    for (const pool of water) {

        if (collision(water, pool)) {

            // água pode ficar na água
            // então não faz nada

        }

    }

}


// =====================================================
// VITÓRIA
// =====================================================

function checkWin() {

    const fireFinished =
        collision(fire, fireDoor);

    const waterFinished =
        collision(water, waterDoor);


    if (
        fireFinished &&
        waterFinished
    ) {

        gameWon = true;

        gameRunning = false;

        screen.style.display = "flex";

        screen.innerHTML = `
            <h1>🎉 VOCÊS VENCERAM!</h1>

            <p>
                Fogo e Água chegaram às suas portas!
            </p>

            <button id="restart">
                JOGAR NOVAMENTE
            </button>
        `;


        document
            .getElementById("restart")
            .addEventListener(
                "click",
                startGame
            );

    }

}


// =====================================================
// DESENHO DO FUNDO
// =====================================================

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        "#111a38"
    );

    gradient.addColorStop(
        1,
        "#080b18"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // pedras no fundo

    ctx.fillStyle =
        "rgba(100,120,170,0.08)";

    for (
        let x = 0;
        x < canvas.width;
        x += 80
    ) {

        ctx.fillRect(
            x,
            100,
            2,
            400
        );

    }

}


// =====================================================
// DESENHAR PLATAFORMAS
// =====================================================

function drawPlatforms() {

    for (const p of platforms) {

        // pedra

        ctx.fillStyle =
            "#454b5c";

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );


        // topo

        ctx.fillStyle =
            "#737b91";

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            5
        );


        // detalhes

        ctx.strokeStyle =
            "#303646";

        ctx.lineWidth = 2;

        for (
            let x = p.x + 15;
            x < p.x + p.width;
            x += 35
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                p.y + 7
            );

            ctx.lineTo(
                x + 10,
                p.y + 16
            );

            ctx.stroke();

        }

    }

}


// =====================================================
// DESENHAR LAVA
// =====================================================

function drawLava() {

    for (const p of lava) {

        const gradient =
            ctx.createLinearGradient(
                0,
                p.y,
                0,
                p.y + p.height
            );

        gradient.addColorStop(
            0,
            "#ff9d00"
        );

        gradient.addColorStop(
            0.5,
            "#ff3c00"
        );

        gradient.addColorStop(
            1,
            "#a50000"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );


        // bolhas

        ctx.fillStyle =
            "#ffd000";

        for (
            let x = p.x + 10;
            x < p.x + p.width;
            x += 25
        ) {

            ctx.beginPath();

            ctx.arc(
                x,
                p.y + 7,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }

}


// =====================================================
// DESENHAR ÁGUA
// =====================================================

function drawWater() {

    for (const p of water) {

        const gradient =
            ctx.createLinearGradient(
                0,
                p.y,
                0,
                p.y + p.height
            );

        gradient.addColorStop(
            0,
            "#4de4ff"
        );

        gradient.addColorStop(
            0.5,
            "#087bd9"
        );

        gradient.addColorStop(
            1,
            "#034b99"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );


        ctx.strokeStyle =
            "rgba(255,255,255,.5)";

        ctx.lineWidth = 2;

        for (
            let x = p.x;
            x < p.x + p.width;
            x += 30
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                p.y + 8
            );

            ctx.quadraticCurveTo(
                x + 7,
                p.y,
                x + 15,
                p.y + 8
            );

            ctx.stroke();

        }

    }

}


// =====================================================
// DESENHAR PORTAS
// =====================================================

function drawDoor(door, color, symbol) {

    ctx.fillStyle =
        "#151927";

    ctx.fillRect(
        door.x,
        door.y,
        door.width,
        door.height
    );


    ctx.strokeStyle =
        color;

    ctx.lineWidth = 4;

    ctx.strokeRect(
        door.x,
        door.y,
        door.width,
        door.height
    );


    ctx.font = "23px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        symbol,
        door.x + door.width / 2,
        door.y + 35
    );

}


// =====================================================
// DESENHAR FOGO
// =====================================================

function drawFire() {

    // brilho

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "#ff3000";


    // corpo

    ctx.fillStyle =
        "#e83316";

    ctx.fillRect(
        fire.x,
        fire.y + 12,
        fire.width,
        28
    );


    // cabeça

    ctx.beginPath();

    ctx.arc(
        fire.x + 15,
        fire.y + 12,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // chama

    ctx.fillStyle =
        "#ffb000";

    ctx.beginPath();

    ctx.moveTo(
        fire.x + 6,
        fire.y + 5
    );

    ctx.lineTo(
        fire.x + 10,
        fire.y - 10
    );

    ctx.lineTo(
        fire.x + 16,
        fire.y + 3
    );

    ctx.lineTo(
        fire.x + 23,
        fire.y - 8
    );

    ctx.lineTo(
        fire.x + 27,
        fire.y + 7
    );

    ctx.closePath();

    ctx.fill();


    // olhos

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "white";

    ctx.fillRect(
        fire.x + 7,
        fire.y + 9,
        5,
        5
    );

    ctx.fillRect(
        fire.x + 19,
        fire.y + 9,
        5,
        5
    );

}


// =====================================================
// DESENHAR ÁGUA
// =====================================================

function drawWaterPlayer() {

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "#00aaff";


    // corpo

    ctx.fillStyle =
        "#138ce0";

    ctx.fillRect(
        water.x,
        water.y + 12,
        water.width,
        28
    );


    // cabeça

    ctx.beginPath();

    ctx.arc(
        water.x + 15,
        water.y + 12,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // gota

    ctx.fillStyle =
        "#72eaff";

    ctx.beginPath();

    ctx.moveTo(
        water.x + 15,
        water.y - 10
    );

    ctx.lineTo(
        water.x + 7,
        water.y + 3
    );

    ctx.lineTo(
        water.x + 15,
        water.y + 9
    );

    ctx.lineTo(
        water.x + 23,
        water.y + 3
    );

    ctx.closePath();

    ctx.fill();


    // olhos

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "white";

    ctx.fillRect(
        water.x + 7,
        water.y + 9,
        5,
        5
    );

    ctx.fillRect(
        water.x + 19,
        water.y + 9,
        5,
        5
    );

}


// =====================================================
// DESENHAR TUDO
// =====================================================

function draw() {

    drawBackground();

    drawPlatforms();

    drawLava();

    drawWater();

    drawDoor(
        fireDoor,
        "#ff3b18",
        "🔥"
    );

    drawDoor(
        waterDoor,
        "#22aaff",
        "💧"
    );

    drawFire();

    drawWaterPlayer();

}


// =====================================================
// LOOP
// =====================================================

function gameLoop() {

    if (gameRunning) {

        updatePlayer(
            fire,
            {
                left: "a",
                right: "d",
                jump: "w"
            }
        );


        updatePlayer(
            water,
            {
                left: "arrowleft",
                right: "arrowright",
                jump: "arrowup"
            }
        );


        checkHazards();

        checkWin();

    }


    draw();

    requestAnimationFrame(gameLoop);

}


// =====================================================
// INICIAR
// =====================================================

function startGame() {

    fire.x = 70;
    fire.y = 500;
    fire.velocityY = 0;
    fire.grounded = false;

    water.x = 120;
    water.y = 500;
    water.velocityY = 0;
    water.grounded = false;


    gameWon = false;
    gameRunning = true;


    screen.style.display = "none";
}


playButton.addEventListener(
    "click",
    startGame
);


// COMEÇAR LOOP

gameLoop();

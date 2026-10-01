const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;

const message = document.getElementById("message");
const startButton = document.getElementById("startButton");

const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// ==========================================
// JOGADORES
// ==========================================

const fire = {
    x: 90,
    y: 450,
    width: 32,
    height: 42,
    speed: 4,
    color: "#ff3b18",
    gravity: 0.7,
    velocityY: 0,
    jumping: false
};

const water = {
    x: 150,
    y: 450,
    width: 32,
    height: 42,
    speed: 4,
    color: "#249cff",
    gravity: 0.7,
    velocityY: 0,
    jumping: false
};

// ==========================================
// MAPA
// ==========================================

const platforms = [
    // chão
    { x: 0, y: 500, width: 960, height: 40 },

    // plataformas
    { x: 40, y: 410, width: 180, height: 20 },
    { x: 270, y: 350, width: 170, height: 20 },
    { x: 500, y: 420, width: 180, height: 20 },
    { x: 720, y: 330, width: 180, height: 20 },

    { x: 120, y: 260, width: 160, height: 20 },
    { x: 390, y: 220, width: 170, height: 20 },
    { x: 650, y: 170, width: 160, height: 20 }
];

// ==========================================
// PERIGOS
// ==========================================

const fireLava = [
    { x: 230, y: 480, width: 80, height: 20 },
    { x: 680, y: 480, width: 100, height: 20 }
];

const waterPools = [
    { x: 440, y: 480, width: 90, height: 20 },
    { x: 800, y: 480, width: 100, height: 20 }
];

// ==========================================
// PORTAS
// ==========================================

const exitFire = {
    x: 850,
    y: 120,
    width: 35,
    height: 50
};

const exitWater = {
    x: 895,
    y: 120,
    width: 35,
    height: 50
};

let gameStarted = false;
let gameWon = false;

// ==========================================
// DESENHO
// ==========================================

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

    gradient.addColorStop(0, "#161b35");
    gradient.addColorStop(1, "#252525");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // estrelas/luzes
    for (let i = 0; i < 35; i++) {
        const x = (i * 97) % canvas.width;
        const y = (i * 53) % 300;

        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(x, y, 3, 3);
    }
}

function drawPlatforms() {
    platforms.forEach(platform => {
        // pedra
        ctx.fillStyle = "#514b48";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        // topo
        ctx.fillStyle = "#77716c";
        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            5
        );

        // detalhes
        ctx.fillStyle = "#393634";

        for (
            let x = platform.x + 10;
            x < platform.x + platform.width;
            x += 30
        ) {
            ctx.fillRect(x, platform.y + 9, 15, 3);
        }
    });
}

function drawLava() {
    fireLava.forEach(lava => {
        ctx.fillStyle = "#d92808";
        ctx.fillRect(lava.x, lava.y, lava.width, lava.height);

        ctx.fillStyle = "#ff5b16";

        for (let x = lava.x; x < lava.x + lava.width; x += 20) {
            ctx.beginPath();
            ctx.arc(x + 10, lava.y + 12, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawWater() {
    waterPools.forEach(pool => {
        ctx.fillStyle = "#087bd1";
        ctx.fillRect(pool.x, pool.y, pool.width, pool.height);

        ctx.fillStyle = "#38b8ff";

        for (let x = pool.x; x < pool.x + pool.width; x += 25) {
            ctx.fillRect(x, pool.y + 5, 15, 3);
        }
    });
}

function drawExit(exit, color, symbol) {
    ctx.fillStyle = "#111";
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.strokeRect(exit.x, exit.y, exit.width, exit.height);

    ctx.fillStyle = color;
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        symbol,
        exit.x + exit.width / 2,
        exit.y + 33
    );
}

function drawFirePlayer() {
    // sombra
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fillRect(fire.x - 3, fire.y + 39, 38, 5);

    // corpo
    ctx.fillStyle = "#ff3b18";
    ctx.fillRect(
        fire.x,
        fire.y + 10,
        fire.width,
        fire.height - 10
    );

    // cabeça
    ctx.beginPath();
    ctx.arc(
        fire.x + 16,
        fire.y + 10,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // olhos
    ctx.fillStyle = "white";
    ctx.fillRect(fire.x + 7, fire.y + 7, 6, 6);
    ctx.fillRect(fire.x + 20, fire.y + 7, 6, 6);

    ctx.fillStyle = "#111";
    ctx.fillRect(fire.x + 9, fire.y + 9, 3, 3);
    ctx.fillRect(fire.x + 22, fire.y + 9, 3, 3);

    // chama
    ctx.fillStyle = "#ffb300";

    ctx.beginPath();
    ctx.moveTo(fire.x + 6, fire.y + 2);
    ctx.lineTo(fire.x + 12, fire.y - 13);
    ctx.lineTo(fire.x + 17, fire.y + 1);
    ctx.lineTo(fire.x + 23, fire.y - 10);
    ctx.lineTo(fire.x + 29, fire.y + 4);
    ctx.closePath();
    ctx.fill();
}

function drawWaterPlayer() {
    // sombra
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fillRect(water.x - 3, water.y + 39, 38, 5);

    // corpo
    ctx.fillStyle = "#249cff";
    ctx.fillRect(
        water.x,
        water.y + 10,
        water.width,
        water.height - 10
    );

    // cabeça
    ctx.beginPath();
    ctx.arc(
        water.x + 16,
        water.y + 10,
        15,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // olhos
    ctx.fillStyle = "white";
    ctx.fillRect(water.x + 7, water.y + 7, 6, 6);
    ctx.fillRect(water.x + 20, water.y + 7, 6, 6);

    ctx.fillStyle = "#111";
    ctx.fillRect(water.x + 9, water.y + 9, 3, 3);
    ctx.fillRect(water.x + 22, water.y + 9, 3, 3);

    // gota
    ctx.fillStyle = "#75d5ff";

    ctx.beginPath();
    ctx.moveTo(water.x + 16, water.y - 13);
    ctx.quadraticCurveTo(
        water.x + 5,
        water.y,
        water.x + 16,
        water.y + 4
    );
    ctx.quadraticCurveTo(
        water.x + 27,
        water.y,
        water.x + 16,
        water.y - 13
    );
    ctx.fill();
}

// ==========================================
// FÍSICA
// ==========================================

function isOnPlatform(player) {
    for (const platform of platforms) {
        const bottom = player.y + player.height;

        if (
            bottom >= platform.y - 3 &&
            bottom <= platform.y + 12 &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        ) {
            return platform;
        }
    }

    return null;
}

function movePlayer(player, controls) {
    if (keys[controls.left]) {
        player.x -= player.speed;
    }

    if (keys[controls.right]) {
        player.x += player.speed;
    }

    player.x = Math.max(
        0,
        Math.min(canvas.width - player.width, player.x)
    );

    const platform = isOnPlatform(player);

    if (platform) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.jumping = false;
    } else {
        player.velocityY += player.gravity;
        player.y += player.velocityY;
        player.jumping = true;
    }

    if (
        keys[controls.jump] &&
        !player.jumping
    ) {
        player.velocityY = -13;
        player.jumping = true;
    }

    if (player.y > canvas.height + 100) {
        resetPlayer(player);
    }
}

function resetPlayer(player) {
    if (player === fire) {
        player.x = 90;
        player.y = 450;
    } else {
        player.x = 150;
        player.y = 450;
    }

    player.velocityY = 0;
}

function touching(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function checkHazards() {
    fireLava.forEach(lava => {
        if (touching(fire, lava)) {
            resetPlayer(fire);
        }
    });

    waterPools.forEach(pool => {
        if (touching(water, pool)) {
            resetPlayer(water);
        }
    });

    // Água não pode tocar na lava
    fireLava.forEach(lava => {
        if (touching(water, lava)) {
            resetPlayer(water);
        }
    });

    // Fogo não pode tocar na água
    waterPools.forEach(pool => {
        if (touching(fire, pool)) {
            resetPlayer(fire);
        }
    });
}

function checkWin() {
    if (
        touching(fire, exitFire) &&
        touching(water, exitWater)
    ) {
        gameWon = true;

        message.style.display = "flex";

        message.querySelector("h1").textContent =
            "🎉 VOCÊS VENCERAM!";

        message.querySelector("p").textContent =
            "Os dois jogadores chegaram à saída!";

        startButton.textContent = "JOGAR NOVAMENTE";
    }
}

// ==========================================
// LOOP DO JOGO
// ==========================================

function update() {
    if (!gameStarted || gameWon) {
        return;
    }

    movePlayer(fire, {
        left: "a",
        right: "d",
        jump: "w"
    });

    movePlayer(water, {
        left: "arrowleft",
        right: "arrowright",
        jump: "arrowup"
    });

    checkHazards();
    checkWin();
}

function draw() {
    drawBackground();
    drawPlatforms();
    drawLava();
    drawWater();

    drawExit(exitFire, "#ff3b18", "🔥");
    drawExit(exitWater, "#249cff", "💧");

    drawFirePlayer();
    drawWaterPlayer();
}

function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// ==========================================
// INICIAR
// ==========================================

startButton.addEventListener("click", () => {
    gameStarted = true;
    gameWon = false;

    message.style.display = "none";

    resetPlayer(fire);
    resetPlayer(water);
});

gameLoop();

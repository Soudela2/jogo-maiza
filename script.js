const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const TILE = 40;

const ROWS = 15;
const COLS = 20;

const WIDTH = COLS * TILE;
const HEIGHT = ROWS * TILE;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const TOTAL_LEVELS = 10;


/* =====================================================
   ELEMENTOS DA INTERFACE
===================================================== */

const lives1Element =
    document.getElementById("lives1");

const lives2Element =
    document.getElementById("lives2");

const score1Element =
    document.getElementById("score1");

const score2Element =
    document.getElementById("score2");

const levelElement =
    document.getElementById("level");

const bananasElement =
    document.getElementById("bananas");

const message =
    document.getElementById("message");

const messageTitle =
    document.getElementById("messageTitle");

const messageText =
    document.getElementById("messageText");

const messageButton =
    document.getElementById("messageButton");


/* =====================================================
   TECLADO
===================================================== */

const keys = {};

window.addEventListener("keydown", event => {

    const key =
        event.key.toLowerCase();

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

        restartEntireGame();

    }

});


window.addEventListener("keyup", event => {

    keys[event.key.toLowerCase()] =
        false;

});


/* =====================================================
   FASES
=====================================================

   # = parede
   . = caminho
   P = jogador
   G = inimigo

   Os mapas são diferentes em cada fase.
===================================================== */

const levels = [

[
"####################",
"#P................G#",
"#.####..####..####.#",
"#..................#",
"#.###.########.###.#",
"#..................#",
"#.###..######..###.#",
"#......G...........#",
"#.###..######..###.#",
"#..................#",
"#.###.########.###.#",
"#..................#",
"#.####..####..####.#",
"#G................P#",
"####################"
],

[
"####################",
"#P......#........G.#",
"#.####..#..######..#",
"#......##..........#",
"###.############.#.#",
"#..................#",
"#..##############..#",
"#......G...........#",
"#..##############..#",
"#..................#",
"#.#.############.###",
"#..................#",
"#..######..######..#",
"#G.................P",
"####################"
],

[
"####################",
"#P.................#",
"#.#####.#####.###..#",
"#.....#.....#......#",
"#.###.#.###.#.####.#",
"#...#.#...#.#....#.#",
"###.#.###.#.####.#.#",
"#...#...G.#......#.#",
"#.#######.######.#.#",
"#.........#......#.#",
"#.#########.####.#.#",
"#.........#....#...#",
"#.#######.####.###.#",
"#G.................P",
"####################"
],

[
"####################",
"#P..#........#....G#",
"#...#..####..#.....#",
"#.#....#..#....###.#",
"#.####.#..####.....#",
"#......#........#..#",
"#.############.#...#",
"#........G.........#",
"#...#.############.#",
"#...#..............#",
"#.#####.##########.#",
"#.......#..........#",
"#.#####.#.########.#",
"#G......#..........P",
"####################"
],

[
"####################",
"#P........#........#",
"#.######..#..######.#",
"#......#..#..#......#",
"####.#.#..#..#.###..#",
"#....#........#.....#",
"#.###############.#.#",
"#......G...........#",
"#.#.##############.#",
"#.#.................#",
"#.###########.#####.#",
"#...........#.......#",
"#.#########.#.#####.#",
"#G..........#.......P",
"####################"
],

[
"####################",
"#P....#...........G#",
"#.##..#.##########.#",
"#....#.............#",
"#.###############..#",
"#........G.........#",
"###.##############.#",
"#..................#",
"#.#################.",
"#..................#",
"#.################.#",
"#..................#",
"#.################.#",
"#G.................P",
"####################"
],

[
"####################",
"#P.................#",
"#.#####.##########.#",
"#.....#............#",
"#####.#.##########.#",
"#.....#....G.......#",
"#.##########.#######",
"#..................#",
"################.#.#",
"#................#.#",
"#.################.#",
"#..................#",
"#.##########.#####.#",
"#G.................P",
"####################"
],

[
"####################",
"#P..#........#....G#",
"#...#..####..#.....#",
"#.###..#..#..###.#.#",
"#......#..#......#.#",
"#.##############.#.#",
"#................#.#",
"#......G...........#",
"#.#################",
"#........#.........#",
"#.######.#.#######.#",
"#......#.#.........#",
"#.####.#.#########.#",
"#G.....#...........P",
"####################"
],

[
"####################",
"#P........#........#",
"#.#######.#.######.#",
"#.......#.#........#",
"#.#####.#.########.#",
"#.#...#.#..........#",
"#.#.#.#.############",
"#...#.#....G.......#",
"###.#.############.#",
"#...#..............#",
"#.################.#",
"#..................#",
"#.###############..#",
"#G.................P",
"####################"
],

[
"####################",
"#P.................#",
"#.#####.#####.#####.#",
"#.....#.....#.......#",
"#####.#.###.#.#####.#",
"#.....#...#.#.......#",
"#.#######.#.#######.#",
"#.......G...........#",
"#.################.#",
"#..................#",
"#.##############.#.#",
"#................#.#",
"#.################.#",
"#G.................P",
"####################"
]

];


/* =====================================================
   ESTADO DO JOGO
===================================================== */

let currentLevel = 0;

let players = [];

let enemies = [];

let bananas = [];

let score1 = 0;

let score2 = 0;

let lives1 = 3;

let lives2 = 3;

let gameRunning = true;

let levelTransition = false;


/* =====================================================
   JOGADOR
===================================================== */

function createPlayer(
    x,
    y,
    color,
    controls
) {

    return {

        x,
        y,

        startX: x,
        startY: y,

        radius: 14,

        speed: 2.8,

        color,

        controls,

        angle: 0,

        mouth: 0

    };

}


/* =====================================================
   CARREGAR FASE
===================================================== */

function loadLevel() {

    players = [];

    enemies = [];

    bananas = [];

    levelTransition = false;


    const map =
        levels[currentLevel];


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < COLS;
            col++
        ) {

            const tile =
                map[row][col];

            const x =
                col * TILE + TILE / 2;

            const y =
                row * TILE + TILE / 2;


            /* jogadores */

            if (tile === "P") {

                if (
                    players.length === 0
                ) {

                    players.push(

                        createPlayer(
                            x,
                            y,
                            "#25d4ff",
                            {
                                up: "w",
                                down: "s",
                                left: "a",
                                right: "d"
                            }
                        )

                    );

                }

                else {

                    players.push(

                        createPlayer(
                            x,
                            y,
                            "#ff5db7",
                            {
                                up: "arrowup",
                                down: "arrowdown",
                                left: "arrowleft",
                                right: "arrowright"
                            }
                        )

                    );

                }

            }


            /* inimigos */

            if (tile === "G") {

                enemies.push({

                    x,
                    y,

                    startX: x,
                    startY: y,

                    radius: 13,

                    speed:
                        1.05 +
                        currentLevel * 0.07,

                    color:
                        enemies.length % 2 === 0
                            ? "#9b6cff"
                            : "#ff675b",

                    directionX: 0,
                    directionY: 1,

                    timer: 0

                });

            }

        }

    }


    /*
    Cria bananinhas em todos os caminhos
    possíveis.
    */

    createBananas();


    updateHUD();

}


/* =====================================================
   CRIAR BANANINHAS
===================================================== */

function createBananas() {

    const map =
        levels[currentLevel];


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < COLS;
            col++
        ) {

            if (
                map[row][col] !== "#"
            ) {

                const x =
                    col * TILE + TILE / 2;

                const y =
                    row * TILE + TILE / 2;


                /*
                Não coloca banana exatamente
                sobre jogador ou inimigo.
                */

                let blocked = false;


                for (const player of players) {

                    if (
                        Math.hypot(
                            player.x - x,
                            player.y - y
                        ) < 25
                    ) {

                        blocked = true;

                    }

                }


                for (const enemy of enemies) {

                    if (
                        Math.hypot(
                            enemy.x - x,
                            enemy.y - y
                        ) < 25
                    ) {

                        blocked = true;

                    }

                }


                if (!blocked) {

                    bananas.push({

                        x,
                        y,

                        collected: false,

                        phase:
                            Math.random() *
                            Math.PI * 2

                    });

                }

            }

        }

    }

}


/* =====================================================
   PAREDE
===================================================== */

function isWall(row, col) {

    if (
        row < 0 ||
        row >= ROWS ||
        col < 0 ||
        col >= COLS
    ) {

        return true;

    }


    return (
        levels[currentLevel][row][col]
        === "#"
    );

}


/* =====================================================
   PODE MOVER?
===================================================== */

function canMove(
    x,
    y,
    radius
) {

    const left =
        Math.floor(
            (x - radius) / TILE
        );

    const right =
        Math.floor(
            (x + radius) / TILE
        );

    const top =
        Math.floor(
            (y - radius) / TILE
        );

    const bottom =
        Math.floor(
            (y + radius) / TILE
        );


    for (
        let row = top;
        row <= bottom;
        row++
    ) {

        for (
            let col = left;
            col <= right;
            col++
        ) {

            if (
                isWall(
                    row,
                    col
                )
            ) {

                return false;

            }

        }

    }


    return true;

}


/* =====================================================
   CONTROLE DO JOGADOR
===================================================== */

function updatePlayer(player) {

    let dx = 0;
    let dy = 0;


    if (
        keys[player.controls.left]
    ) {

        dx = -1;

    }

    if (
        keys[player.controls.right]
    ) {

        dx = 1;

    }

    if (
        keys[player.controls.up]
    ) {

        dy = -1;

    }

    if (
        keys[player.controls.down]
    ) {

        dy = 1;

    }


    /*
    Movimento diagonal normalizado.
    */

    if (
        dx !== 0 &&
        dy !== 0
    ) {

        dx *= 0.707;
        dy *= 0.707;

    }


    const nextX =
        player.x +
        dx * player.speed;


    const nextY =
        player.y +
        dy * player.speed;


    if (
        canMove(
            nextX,
            player.y,
            player.radius
        )
    ) {

        player.x = nextX;

    }


    if (
        canMove(
            player.x,
            nextY,
            player.radius
        )
    ) {

        player.y = nextY;

    }


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        player.angle =
            Math.atan2(
                dy,
                dx
            );

    }


    player.mouth += 0.18;

}


/* =====================================================
   BANANINHAS
===================================================== */

function collectBananas(
    player,
    playerNumber
) {

    for (const banana of bananas) {

        if (
            banana.collected
        ) {

            continue;

        }


        const distance =
            Math.hypot(
                player.x - banana.x,
                player.y - banana.y
            );


        if (
            distance < 22
        ) {

            banana.collected = true;


            if (
                playerNumber === 1
            ) {

                score1 += 10;

            }

            else {

                score2 += 10;

            }

        }

    }

}


/* =====================================================
   INIMIGOS
===================================================== */

function updateEnemies() {

    for (const enemy of enemies) {

        enemy.timer--;


        /*
        Encontra o jogador mais próximo.
        */

        let target =
            players[0];


        if (
            players.length > 1
        ) {

            const distance1 =
                Math.hypot(
                    enemy.x - players[0].x,
                    enemy.y - players[0].y
                );


            const distance2 =
                Math.hypot(
                    enemy.x - players[1].x,
                    enemy.y - players[1].y
                );


            if (
                distance2 < distance1
            ) {

                target =
                    players[1];

            }

        }


        /*
        Troca de direção.
        */

        if (
            enemy.timer <= 0
        ) {

            enemy.timer =
                30 +
                Math.random() * 60;


            const horizontal =
                Math.abs(
                    target.x - enemy.x
                );


            const vertical =
                Math.abs(
                    target.y - enemy.y
                );


            if (
                horizontal > vertical
            ) {

                enemy.directionX =
                    target.x > enemy.x
                        ? 1
                        : -1;

                enemy.directionY = 0;

            }

            else {

                enemy.directionX = 0;

                enemy.directionY =
                    target.y > enemy.y
                        ? 1
                        : -1;

            }


            /*
            Se a direção escolhida estiver
            bloqueada, tenta outra.
            */

            const testX =
                enemy.x +
                enemy.directionX *
                TILE;


            const testY =
                enemy.y +
                enemy.directionY *
                TILE;


            if (
                !canMove(
                    testX,
                    testY,
                    enemy.radius
                )
            ) {

                const directions = [

                    {
                        x: 1,
                        y: 0
                    },

                    {
                        x: -1,
                        y: 0
                    },

                    {
                        x: 0,
                        y: 1
                    },

                    {
                        x: 0,
                        y: -1
                    }

                ];


                const valid =
                    directions.filter(
                        direction =>

                            canMove(
                                enemy.x +
                                direction.x *
                                TILE,

                                enemy.y +
                                direction.y *
                                TILE,

                                enemy.radius
                            )
                    );


                if (
                    valid.length > 0
                ) {

                    const direction =
                        valid[
                            Math.floor(
                                Math.random() *
                                valid.length
                            )
                        ];


                    enemy.directionX =
                        direction.x;

                    enemy.directionY =
                        direction.y;

                }

            }

        }


        const nextX =
            enemy.x +
            enemy.directionX *
            enemy.speed;


        const nextY =
            enemy.y +
            enemy.directionY *
            enemy.speed;


        if (
            canMove(
                nextX,
                enemy.y,
                enemy.radius
            )
        ) {

            enemy.x =
                nextX;

        }

        else {

            enemy.timer = 0;

        }


        if (
            canMove(
                enemy.x,
                nextY,
                enemy.radius
            )
        ) {

            enemy.y =
                nextY;

        }

        else {

            enemy.timer = 0;

        }

    }

}


/* =====================================================
   COLISÃO JOGADOR / INIMIGO
===================================================== */

function checkEnemyCollisions() {

    players.forEach(
        (player, index) => {

            for (
                const enemy of enemies
            ) {

                const distance =
                    Math.hypot(
                        player.x - enemy.x,
                        player.y - enemy.y
                    );


                if (
                    distance <
                    player.radius +
                    enemy.radius
                ) {

                    loseLife(index);

                    return;

                }

            }

        }
    );

}


/* =====================================================
   PERDER VIDA
===================================================== */

function loseLife(playerIndex) {

    if (
        playerIndex === 0
    ) {

        lives1--;

    }

    else {

        lives2--;

    }


    /*
    Se os dois ficaram sem vidas,
    fim de jogo.
    */

    if (
        lives1 <= 0 &&
        lives2 <= 0
    ) {

        gameOver();

        return;

    }


    /*
    Reposiciona o jogador.
    */

    const player =
        players[playerIndex];


    player.x =
        player.startX;

    player.y =
        player.startY;


    /*
    Reinicia os inimigos.
    */

    for (
        const enemy of enemies
    ) {

        enemy.x =
            enemy.startX;

        enemy.y =
            enemy.startY;

    }


    updateHUD();

}


/* =====================================================
   VERIFICAR FIM DA FASE
===================================================== */

function checkLevelComplete() {

    const remaining =
        bananas.filter(
            banana =>
                !banana.collected
        ).length;


    if (
        remaining === 0 &&
        !levelTransition
    ) {

        levelTransition = true;


        /*
        Última fase.
        */

        if (
            currentLevel ===
            TOTAL_LEVELS - 1
        ) {

            winGame();

            return;

        }


        showNextLevel();

    }

}


/* =====================================================
   PRÓXIMA FASE
===================================================== */

function showNextLevel() {

    gameRunning = false;


    message.classList.remove(
        "hidden"
    );


    messageTitle.textContent =
        `🎉 FASE ${currentLevel + 1} COMPLETA!`;


    messageText.textContent =
        `Preparem-se para a fase ${
            currentLevel + 2
        }!`;


    messageButton.textContent =
        "Próxima fase";


    messageButton.onclick =
        () => {

            currentLevel++;

            message.classList.add(
                "hidden"
            );

            gameRunning = true;

            loadLevel();

        };

}


/* =====================================================
   VITÓRIA FINAL
===================================================== */

function winGame() {

    gameRunning = false;


    message.classList.remove(
        "hidden"
    );


    messageTitle.textContent =
        "🏆 VOCÊS ZERARAM O JOGO!";


    messageText.textContent =
        `Parabéns! Vocês completaram as 10 fases e coletaram todas as bananinhas. Pontuação final: ${score1} x ${score2}.`;


    messageButton.textContent =
        "Jogar novamente";


    messageButton.onclick =
        restartEntireGame;

}


/* =====================================================
   GAME OVER
===================================================== */

function gameOver() {

    gameRunning = false;


    message.classList.remove(
        "hidden"
    );


    messageTitle.textContent =
        "💥 GAME OVER";


    messageText.textContent =
        `Os dois jogadores ficaram sem vidas. Pontuação: ${score1} x ${score2}.`;


    messageButton.textContent =
        "Tentar novamente";


    messageButton.onclick =
        restartEntireGame;

}


/* =====================================================
   REINICIAR TUDO
===================================================== */

function restartEntireGame() {

    currentLevel = 0;

    score1 = 0;

    score2 = 0;

    lives1 = 3;

    lives2 = 3;

    gameRunning = true;

    levelTransition = false;


    message.classList.add(
        "hidden"
    );


    loadLevel();

}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    lives1Element.textContent =
        Math.max(
            0,
            lives1
        );

    lives2Element.textContent =
        Math.max(
            0,
            lives2
        );


    score1Element.textContent =
        score1;

    score2Element.textContent =
        score2;


    levelElement.textContent =
        `${currentLevel + 1} / ${TOTAL_LEVELS}`;


    const remaining =
        bananas.filter(
            banana =>
                !banana.collected
        ).length;


    bananasElement.textContent =
        remaining;

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
        "#061b2e"
    );

    gradient.addColorStop(
        1,
        "#020b14"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    /*
    Pequenas partículas de neve.
    */

    ctx.fillStyle =
        "rgba(180,240,255,.35)";


    for (
        let i = 0;
        i < 90;
        i++
    ) {

        const x =
            (i * 137) %
            WIDTH;

        const y =
            (i * 73) %
            HEIGHT;


        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }

}


/* =====================================================
   DESENHAR LABIRINTO
===================================================== */

function drawMaze() {

    const map =
        levels[currentLevel];


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < COLS;
            col++
        ) {

            if (
                map[row][col] !== "#"
            ) {

                continue;

            }


            const x =
                col * TILE;

            const y =
                row * TILE;


            const gradient =
                ctx.createLinearGradient(
                    x,
                    y,
                    x + TILE,
                    y + TILE
                );


            gradient.addColorStop(
                0,
                "#17769b"
            );

            gradient.addColorStop(
                .5,
                "#0b486b"
            );

            gradient.addColorStop(
                1,
                "#062d4a"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(
                x + 1,
                y + 1,
                TILE - 2,
                TILE - 2
            );


            /*
            Borda de gelo.
            */

            ctx.strokeStyle =
                "#39c9ed";

            ctx.lineWidth = 1;


            ctx.strokeRect(
                x + 4,
                y + 4,
                TILE - 8,
                TILE - 8
            );


            /*
            Brilho.
            */

            ctx.fillStyle =
                "rgba(170,245,255,.13)";


            ctx.fillRect(
                x + 5,
                y + 5,
                TILE - 10,
                5
            );

        }

    }

}


/* =====================================================
   DESENHAR BANANAS
===================================================== */

function drawBananas() {

    for (
        const banana of bananas
    ) {

        if (
            banana.collected
        ) {

            continue;

        }


        banana.phase += 0.04;


        const floatY =
            Math.sin(
                banana.phase
            ) * 2;


        ctx.save();


        ctx.translate(
            banana.x,
            banana.y + floatY
        );


        ctx.rotate(
            -0.35
        );


        ctx.shadowColor =
            "#ffe75b";

        ctx.shadowBlur = 12;


        /*
        Banana curva.
        */

        ctx.strokeStyle =
            "#ffe34d";

        ctx.lineWidth = 7;

        ctx.lineCap =
            "round";


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            9,
            0.4,
            Math.PI * 1.45
        );

        ctx.stroke();


        /*
        Parte interna.
        */

        ctx.strokeStyle =
            "#fff28a";

        ctx.lineWidth = 2;


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            6,
            0.4,
            Math.PI * 1.45
        );

        ctx.stroke();


        /*
        Pontas.
        */

        ctx.fillStyle =
            "#a67c16";


        ctx.beginPath();

        ctx.arc(
            -7,
            -5,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            7,
            5,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();

    }

}


/* =====================================================
   DESENHAR JOGADOR
===================================================== */

function drawPlayer(player) {

    ctx.save();


    ctx.translate(
        player.x,
        player.y
    );


    ctx.rotate(
        player.angle
    );


    ctx.shadowColor =
        player.color;

    ctx.shadowBlur = 18;


    ctx.fillStyle =
        player.color;


    const mouth =
        .18 +
        Math.abs(
            Math.sin(
                player.mouth
            )
        ) * .20;


    /*
    Corpo estilo personagem de labirinto.
    */

    ctx.beginPath();

    ctx.moveTo(
        0,
        0
    );


    ctx.arc(
        0,
        0,
        player.radius,
        mouth,
        Math.PI * 2 - mouth
    );


    ctx.closePath();

    ctx.fill();


    /*
    Olho.
    */

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(
        5,
        -7,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#122235";


    ctx.beginPath();

    ctx.arc(
        6,
        -7,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


/* =====================================================
   DESENHAR INIMIGO
===================================================== */

function drawEnemy(enemy) {

    ctx.save();


    ctx.translate(
        enemy.x,
        enemy.y
    );


    ctx.shadowColor =
        enemy.color;

    ctx.shadowBlur = 15;


    ctx.fillStyle =
        enemy.color;


    /*
    Cabeça.
    */

    ctx.beginPath();

    ctx.arc(
        0,
        -1,
        enemy.radius,
        Math.PI,
        0
    );


    /*
    Base ondulada.
    */

    ctx.lineTo(
        enemy.radius,
        enemy.radius
    );


    ctx.lineTo(
        enemy.radius * .5,
        enemy.radius - 5
    );


    ctx.lineTo(
        0,
        enemy.radius
    );


    ctx.lineTo(
        -enemy.radius * .5,
        enemy.radius - 5
    );


    ctx.lineTo(
        -enemy.radius,
        enemy.radius
    );


    ctx.closePath();

    ctx.fill();


    ctx.shadowBlur = 0;


    /*
    Olhos.
    */

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(
        -5,
        -3,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        5,
        -3,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#172033";


    ctx.beginPath();

    ctx.arc(
        -5,
        -3,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        5,
        -3,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


/* =====================================================
   DESENHAR TUDO
===================================================== */

function draw() {

    drawBackground();

    drawMaze();

    drawBananas();


    for (
        const enemy of enemies
    ) {

        drawEnemy(enemy);

    }


    for (
        const player of players
    ) {

        drawPlayer(player);

    }

}


/* =====================================================
   ATUALIZAÇÃO
===================================================== */

function update() {

    if (!gameRunning) {

        return;

    }


    updatePlayer(
        players[0]
    );

    updatePlayer(
        players[1]
    );


    collectBananas(
        players[0],
        1
    );

    collectBananas(
        players[1],
        2
    );


    updateEnemies();


    checkEnemyCollisions();


    checkLevelComplete();


    updateHUD();

}


/* =====================================================
   LOOP PRINCIPAL
===================================================== */

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   INICIAR
===================================================== */

restartEntireGame();

gameLoop();

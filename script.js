/* ==========================================
   MARIO VS BOWSER
   JOGO PARA 2 JOGADORES
========================================== */

const mario = document.getElementById("mario");
const bowser = document.getElementById("bowser");

const marioAttack = document.getElementById("marioAttack");
const bowserAttack = document.getElementById("bowserAttack");

const marioHealth = document.getElementById("marioHealth");
const bowserHealth = document.getElementById("bowserHealth");

const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");


/* ==========================================
   ESTADO
========================================== */

let gameRunning = false;

let marioX = 150;
let bowserX = 650;

let marioY = 0;
let bowserY = 0;

let marioVelocity = 0;
let bowserVelocity = 0;

let marioHP = 100;
let bowserHP = 100;

let marioDirection = 1;
let bowserDirection = -1;

let marioAttacking = false;
let bowserAttacking = false;

let keys = {};


/* ==========================================
   CONFIGURAÇÕES
========================================== */

const GRAVITY = 0.8;

const JUMP_POWER = -15;

const MARIO_SPEED = 5;

const BOWSER_SPEED = 4;


/* ==========================================
   TECLADO
========================================== */

document.addEventListener("keydown", function(event) {

    const key = event.key.toLowerCase();

    keys[key] = true;

    /*
       Evita que as setas movimentem
       a página.
    */

    if (
        key === "arrowleft" ||
        key === "arrowright" ||
        key === "arrowup"
    ) {
        event.preventDefault();
    }


    /* ATAQUE DO MARIO */

    if (key === "f") {

        marioAttackAction();

    }


    /* ATAQUE DO BOWSER */

    if (key === "l") {

        bowserAttackAction();

    }


    /* REINICIAR */

    if (key === "r" && !gameRunning) {

        location.reload();

    }

});


document.addEventListener("keyup", function(event) {

    const key = event.key.toLowerCase();

    keys[key] = false;

});


/* ==========================================
   COMEÇAR
========================================== */

startButton.addEventListener("click", function() {

    menu.style.display = "none";

    gameRunning = true;

    marioX = 150;

    bowserX = 650;

    marioHP = 100;

    bowserHP = 100;

    updateHealth();

});


/* ==========================================
   MOVIMENTO
========================================== */

function updateMovement() {

    if (!gameRunning) return;


    /* =====================
       MARIO
    ===================== */

    if (keys["a"]) {

        marioX -= MARIO_SPEED;

        marioDirection = -1;

    }


    if (keys["d"]) {

        marioX += MARIO_SPEED;

        marioDirection = 1;

    }


    /* PULAR */

    if (keys["w"] && marioY === 0) {

        marioVelocity = JUMP_POWER;

    }


    /* =====================
       BOWSER
    ===================== */

    if (keys["arrowleft"]) {

        bowserX -= BOWSER_SPEED;

        bowserDirection = -1;

    }


    if (keys["arrowright"]) {

        bowserX += BOWSER_SPEED;

        bowserDirection = 1;

    }


    /* PULAR */

    if (keys["arrowup"] && bowserY === 0) {

        bowserVelocity = JUMP_POWER;

    }


    /* =====================
       GRAVIDADE MARIO
    ===================== */

    marioVelocity += GRAVITY;

    marioY += marioVelocity;


    if (marioY > 0) {

        marioY = 0;

        marioVelocity = 0;

    }


    /* =====================
       GRAVIDADE BOWSER
    ===================== */

    bowserVelocity += GRAVITY;

    bowserY += bowserVelocity;


    if (bowserY > 0) {

        bowserY = 0;

        bowserVelocity = 0;

    }


    /* =====================
       LIMITES
    ===================== */

    const maxX = window.innerWidth - 100;


    marioX = Math.max(
        0,
        Math.min(maxX, marioX)
    );


    bowserX = Math.max(
        0,
        Math.min(maxX, bowserX)
    );

}


/* ==========================================
   ATAQUE DO MARIO
========================================== */

function marioAttackAction() {

    if (!gameRunning) return;

    if (marioAttacking) return;


    marioAttacking = true;

    marioAttack.style.display = "block";


    /*
       Verifica o golpe depois de
       alguns milissegundos.
    */

    setTimeout(function() {

        if (!gameRunning) return;


        const distance =
            Math.abs(marioX - bowserX);


        if (
            distance < 110 &&
            Math.abs(marioY - bowserY) < 60
        ) {

            bowserHP -= 12;


            if (bowserHP < 0) {

                bowserHP = 0;

            }


            updateHealth();

        }

    }, 100);


    setTimeout(function() {

        marioAttacking = false;

        marioAttack.style.display = "none";

    }, 300);

}


/* ==========================================
   ATAQUE DO BOWSER
========================================== */

function bowserAttackAction() {

    if (!gameRunning) return;

    if (bowserAttacking) return;


    bowserAttacking = true;

    bowserAttack.style.display = "block";


    setTimeout(function() {

        if (!gameRunning) return;


        const distance =
            Math.abs(marioX - bowserX);


        if (
            distance < 120 &&
            Math.abs(marioY - bowserY) < 60
        ) {

            marioHP -= 10;


            if (marioHP < 0) {

                marioHP = 0;

            }


            updateHealth();

        }

    }, 100);


    setTimeout(function() {

        bowserAttacking = false;

        bowserAttack.style.display = "none";

    }, 300);

}


/* ==========================================
   VIDA
========================================== */

function updateHealth() {

    marioHealth.style.width =
        marioHP + "%";


    bowserHealth.style.width =
        bowserHP + "%";


    if (marioHP <= 0) {

        endGame("🐢 BOWSER VENCEU!");

    }


    if (bowserHP <= 0) {

        endGame("🍄 MARIO VENCEU!");

    }

}


/* ==========================================
   RENDERIZAR
========================================== */

function render() {

    /*
       Posição do Mario
    */

    mario.style.left =
        marioX + "px";

    mario.style.bottom =
        (90 + marioY) + "px";


    /*
       Posição do Bowser
    */

    bowser.style.left =
        bowserX + "px";

    bowser.style.bottom =
        (90 + bowserY) + "px";


    /*
       Ataque Mario
    */

    if (marioAttacking) {

        if (marioDirection === 1) {

            marioAttack.style.left =
                (marioX + 55) + "px";

        } else {

            marioAttack.style.left =
                (marioX - 60) + "px";

        }


        marioAttack.style.bottom =
            (130 + marioY) + "px";

    }


    /*
       Ataque Bowser
    */

    if (bowserAttacking) {

        if (bowserDirection === 1) {

            bowserAttack.style.left =
                (bowserX + 70) + "px";

        } else {

            bowserAttack.style.left =
                (bowserX - 60) + "px";

        }


        bowserAttack.style.bottom =
            (135 + bowserY) + "px";

    }

}


/* ==========================================
   FINAL DA BATALHA
========================================== */

function endGame(winner) {

    gameRunning = false;


    setTimeout(function() {

        menu.style.display = "flex";


        menu.innerHTML = `

            <div class="menu-box">

                <h1>${winner}</h1>

                <h2>
                    ${
                        bowserHP <= 0
                        ? "👸 Peach foi libertada!"
                        : "🔥 O castelo continua protegido!"
                    }
                </h2>

                <p>
                    Pressione <b>R</b>
                    para jogar novamente.
                </p>

                <button id="startButton">
                    JOGAR NOVAMENTE
                </button>

            </div>

        `;


        document
            .getElementById("startButton")
            .addEventListener(
                "click",
                function() {

                    location.reload();

                }
            );

    }, 300);

}


/* ==========================================
   LOOP DO JOGO
========================================== */

function gameLoop() {

    updateMovement();

    render();

    requestAnimationFrame(gameLoop);

}


/* ==========================================
   INICIAR LOOP
========================================== */

gameLoop();

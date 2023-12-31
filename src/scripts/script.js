/* 
Original code by: https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5 
Upgraded by: https://github.com/Raxuis 
*/

const myCanvas = document.getElementById('myCanvas');
const context = myCanvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 75
const maxPaddleY = myCanvas.height - grid - paddleHeight;
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const scoreHTML = document.getElementById('scoreHTML');
let scoreLeft = 0;
let scoreRight = 0;

var paddleSpeed = 4;
var ballSpeed = 3;

const leftPaddle = {
    // start in the middle of the game on the left side
    x: grid * 2,
    y: myCanvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,

    // paddle velocity
    dy: 0
};

const rightPaddle = {
    // start in the middle of the game on the right side
    x: myCanvas.width - grid * 3,
    y: myCanvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,
    // paddle velocity
    dy: 0
};

const ball = {
    // start in the middle of the game
    x: myCanvas.width / 2,
    y: myCanvas.height / 2,
    width: grid,
    height: grid,

    // keep track of when need to reset the ball position
    resetting: false,

    // ball velocity (start going to the top-right corner)
    dx: ballSpeed,
    dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/fr/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}
function updateScore() {
    scoreHTML.innerHTML = `${scoreLeft} : ${scoreRight}`
}
// game loop
function loop() {
    requestAnimationFrame(loop);
    // RESET DRAW
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);

    // move paddles by their velocity
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // prevent paddles from going through walls
    if (leftPaddle.y < grid) {
        leftPaddle.y = grid;
    }
    else if (leftPaddle.y > maxPaddleY) {
        leftPaddle.y = maxPaddleY;
    }

    if (rightPaddle.y < grid) {
        rightPaddle.y = grid;
    }
    else if (rightPaddle.y > maxPaddleY) {
        rightPaddle.y = maxPaddleY;
    }

    // draw paddles
    context.fillStyle = 'white';
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // move ball by its velocity
    ball.x += ball.dx;
    ball.y += ball.dy;

    // prevent ball from going through walls by changing its velocity
    if (ball.y < grid) {
        ball.y = grid;
        ball.dy *= -1;
    }
    else if (ball.y + grid > myCanvas.height - grid) {
        ball.y = myCanvas.height - grid * 2;
        ball.dy *= -1;
    }
    // reset ball if it goes past paddle (but only if we haven't already done so)
    if ((ball.x < 0 || ball.x > myCanvas.width) && !ball.resetting) {
        if (ball.x < 0) {
            scoreRight++;
        }
        else if (ball.x > myCanvas.width) {
            scoreLeft++;
        }

        wait = true
        resetGame(wait);
    }

    // check to see if ball collides with paddle. if they do change x velocity
    if (collides(ball, leftPaddle)) {
        ball.dx *= -1;

        // move ball next to the paddle otherwise the collision will happen again
        // in the next frame
        ball.x = leftPaddle.x + leftPaddle.width;
    }
    else if (collides(ball, rightPaddle)) {
        ball.dx *= -1;

        // move ball next to the paddle otherwise the collision will happen again
        // in the next frame
        ball.x = rightPaddle.x - ball.width;
    }

    // draw ball
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // draw walls
    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, myCanvas.width, grid);
    context.fillRect(0, myCanvas.height - grid, myCanvas.width, myCanvas.height);

    // draw dotted line down the middle
    for (let i = grid; i < myCanvas.height - grid; i += grid * 2) {
        context.fillRect(myCanvas.width / 2 - grid / 2, i, grid, grid);
    }
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function (e) {

    // up arrow key
    if (e.which === 38) {
        rightPaddle.dy = -paddleSpeed;
    }
    // down arrow key
    else if (e.which === 40) {
        rightPaddle.dy = paddleSpeed;
    }

    // a key
    if (e.which === 90) {
        leftPaddle.dy = -paddleSpeed;
    }
    // q key
    else if (e.which === 83) {
        leftPaddle.dy = paddleSpeed;
    }
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function (e) {
    if (e.which === 38 || e.which === 40) {
        rightPaddle.dy = 0;
    }

    if (e.which === 90 || e.which === 83) {
        leftPaddle.dy = 0;
    }
});

// start the game
startButton.addEventListener('click', () => {
    scoreHTML.innerHTML = `${scoreLeft} : ${scoreRight}`
    startButton.disabled = true;
    requestAnimationFrame(loop);
})
resetButton.addEventListener('click', () => {
    wait = false
    resetGame(wait);
})
function resetGame(wait) {
    ball.resetting = true;

    // give some time for the player to recover before launching the ball again
    if (wait) {
        setTimeout(() => {
            ball.resetting = false;
            ball.x = myCanvas.width / 2;
            ball.y = myCanvas.height / 2;
        }, 2000);
    } else {
        scoreLeft = 0;
        scoreRight = 0;
        ball.resetting = false;
        ball.x = myCanvas.width / 2;
        ball.y = myCanvas.height / 2;
    }
    updateScore();
}
document.addEventListener('keyup', (e) => {
    switch (e.which) {
        case 8:
            location.reload();
            break;
        case 16:
            ball.dx *= -1;
            break;
        case 9:
            ball.dy *= -1;
            break;
        case 13:
            ball.x = Math.random() < 0.5 ? myCanvas.width / (4 + Math.floor(Math.random() * 2)) : myCanvas.width * 3 / 4 + Math.floor(Math.random() * 2);
            ball.y = Math.random() < 0.5 ? myCanvas.height / (4 + Math.floor(Math.random() * 2)) : myCanvas.height * 3 / 4 + Math.floor(Math.random() * 2);
            ball.dx *= Math.random() < 0.5 ? 1 : -1;
            ball.dy *= Math.random() < 0.5 ? 1 : -1;
            break;

    }
});
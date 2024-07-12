// Define game directions
const Direction = {
    idle: 0,
    up: 1,
    down: 2,
    left: 3,
    right: 4
};

// Define rounds and colors
const GameRounds = [5, 5, 3, 3, 2];
const GameColors = ['#ff5733', '#33ff57', '#3357ff', '#f39c12', '#8e44ad'];

// Ball object
const GameBall = {
    create: function (speed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: Math.random() < 0.5 ? Direction.left : Direction.right,
            moveY: Math.random() < 0.5 ? Direction.up : Direction.down,
            speed: speed || 7
        };
    }
};

// Paddle object
const GamePaddle = {
    create: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150 - 18,
            y: (this.canvas.height / 2) - 90,
            score: 0,
            move: Direction.idle,
            speed: 8
        };
    }
};

// Main game object
const PongGame = {
    // Initialize the game
    initialize: function (mode) {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;
        this.canvas.height = 700;

        this.canvas.style.width = (this.canvas.width / 2) + "px";
        this.canvas.style.height = (this.canvas.height / 2) + "px";

        this.player1 = GamePaddle.create.call(this, 'left');
        this.player2 = GamePaddle.create.call(this, 'right');
        this.ball = GameBall.create.call(this);

        this.player2.speed = 5;
        this.running = this.over = false;
        this.turn = this.player2;
        this.timer = this.round = 0;
        this.color = '#ff5733';
        this.mode = mode; // Set game mode

        document.getElementById('menu').classList.add('hidden');
        this.canvas.classList.remove('hidden');
        document.getElementById('instructions').classList.remove('hidden');

        PongGame.listen();
    },

    // Display end game menu
    endGameMenu: function (text) {
        PongGame.context.font = '45px Arial';
        PongGame.context.fillStyle = this.color;

        PongGame.context.fillRect(
            PongGame.canvas.width / 2 - 350,
            PongGame.canvas.height / 2 - 48,
            700,
            100
        );

        PongGame.context.fillStyle = '#ffffff';
        PongGame.context.fillText(text,
            PongGame.canvas.width / 2,
            PongGame.canvas.height / 2 + 15
        );

        setTimeout(function () {
            PongGame.initialize(PongGame.mode);
        }, 3000);
    },

    // Display start menu
    menu: function () {
        PongGame.draw();
        this.context.font = '50px Arial';
        this.context.fillStyle = this.color;

        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        this.context.fillStyle = '#ffffff';
        this.context.fillText('Press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },

    // Update game state
    update: function () {
        if (!this.over) {
            if (this.ball.x <= 0) PongGame._resetTurn.call(this, this.player2, this.player1);
            if (this.ball.x >= this.canvas.width - this.ball.width) PongGame._resetTurn.call(this, this.player1, this.player2);
            if (this.ball.y <= 0) this.ball.moveY = Direction.down;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = Direction.up;

            // Player1 movement
            if (this.player1.move === Direction.up) this.player1.y -= this.player1.speed;
            else if (this.player1.move === Direction.down) this.player1.y += this.player1.speed;

            // Player2 movement
            if (this.mode === '2-player') {
                if (this.player2.move === Direction.up) this.player2.y -= this.player2.speed;
                else if (this.player2.move === Direction.down) this.player2.y += this.player2.speed;
            } else {
                // AI movement
                if (this.player2.y > this.ball.y - (this.player2.height / 2)) {
                    if (this.ball.moveX === Direction.right) this.player2.y -= this.player2.speed / 1.5;
                    else this.player2.y -= this.player2.speed / 4;
                }
                if (this.player2.y < this.ball.y - (this.player2.height / 2)) {
                    if (this.ball.moveX === Direction.right) this.player2.y += this.player2.speed / 1.5;
                    else this.player2.y += this.player2.speed / 4;
                }
            }

            // Prevent paddles from going out of canvas
            if (this.player1.y < 0) this.player1.y = 0;
            if (this.player1.y + this.player1.height > this.canvas.height) this.player1.y = this.canvas.height - this.player1.height;
            if (this.player2.y < 0) this.player2.y = 0;
            if (this.player2.y + this.player2.height > this.canvas.height) this.player2.y = this.canvas.height - this.player2.height;

            // Ball movement
            if (this.ball.moveY === Direction.up) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === Direction.down) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === Direction.left) this.ball.x -= (this.ball.speed / 1.5);
            else if (this.ball.moveX === Direction.right) this.ball.x += (this.ball.speed / 1.5);

            // Ball collision with player1
            if (this.ball.x <= this.player1.x + this.player1.width && this.ball.x + this.ball.width >= this.player1.x) {
                if (this.ball.y <= this.player1.y + this.player1.height && this.ball.y + this.ball.height >= this.player1.y) {
                    this.ball.x = (this.player1.x + this.ball.width);
                    this.ball.moveX = Direction.right;
                }
            }

            // Ball collision with player2
            if (this.ball.x <= this.player2.x + this.player2.width && this.ball.x + this.ball.width >= this.player2.x) {
                if (this.ball.y <= this.player2.y + this.player2.height && this.ball.y + this.ball.height >= this.player2.y) {
                    this.ball.x = (this.player2.x - this.ball.width);
                    this.ball.moveX = Direction.left;
                }
            }

            // Round transition
            if (this.player1.score === GameRounds[this.round]) {
                if (!GameRounds[this.round + 1]) {
                    this.over = true;
                    setTimeout(function () { PongGame.endGameMenu('Winner!'); }, 1000);
                } else {
                    this.color = this._generateRoundColor();
                    this.player1.score = this.player2.score = 0;
                    this.player1.speed += 0.5;
                    this.player2.speed += 1;
                    this.ball.speed += 1;
                    this.round += 1;
                }
            } else if (this.player2.score === GameRounds[this.round]) {
                if (!GameRounds[this.round + 1]) {
                    this.over = true;
                    setTimeout(function () { PongGame.endGameMenu('Game Over!'); }, 1000);
                } else {
                    this.color = this._generateRoundColor();
                    this.player1.score = this.player2.score = 0;
                    this.player1.speed += 0.5;
                    this.player2.speed += 1;
                    this.ball.speed += 1;
                    this.round += 1;
                }
            }
        }
    },

    // Draw game elements
    draw: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = '#ffffff';
        this.context.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        this.context.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);

        if (PongGame._turnDelayIsOver.call(this)) {
            this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        }

        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo(this.canvas.width / 2, 0);
        this.context.lineTo(this.canvas.width / 2, this.canvas.height);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        this.context.font = '100px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(this.player1.score.toString(), (this.canvas.width / 2) - 300, 200);
        this.context.fillText(this.player2.score.toString(), (this.canvas.width / 2) + 300, 200);

        this.context.font = '30px Arial';
        this.context.fillText('Round ' + (PongGame.round + 1), (this.canvas.width / 2), 35);
        this.context.fillText(GameRounds[PongGame.round] ? GameRounds[PongGame.round] : GameRounds[0], (this.canvas.width / 2), 100);
    },

    // Handle game start
    listen: function () {
        document.addEventListener('keydown', function (key) {
            if (!PongGame.running) {
                PongGame.running = true;
                window.requestAnimationFrame(PongGame.loop);
            }

            // Handle player1 controls
            if (PongGame.mode === '2-player') {
                if (key.keyCode === 87) PongGame.player1.move = Direction.up;   // W key
                if (key.keyCode === 83) PongGame.player1.move = Direction.down; // S key
            } else {
                if (key.keyCode === 38 || key.keyCode === 87) PongGame.player1.move = Direction.up; // Up arrow or W key
                if (key.keyCode === 40 || key.keyCode === 83) PongGame.player1.move = Direction.down; // Down arrow or S key
            }

            // Handle player2 controls for 2-player mode
            if (PongGame.mode === '2-player') {
                if (key.keyCode === 38) PongGame.player2.move = Direction.up; // Up arrow
                if (key.keyCode === 40) PongGame.player2.move = Direction.down; // Down arrow
            }
        });

        document.addEventListener('keyup', function (key) {
            if (PongGame.mode === '2-player') {
                if (key.keyCode === 87 || key.keyCode === 83) PongGame.player1.move = Direction.idle; // W or S key
                if (key.keyCode === 38 || key.keyCode === 40) PongGame.player2.move = Direction.idle; // Up or Down arrow
            } else {
                if (key.keyCode === 38 || key.keyCode === 40 || key.keyCode === 87 || key.keyCode === 83) PongGame.player1.move = Direction.idle; // Up, Down, W, or S key
            }
        });
    },

    // Main game loop
    loop: function () {
        PongGame.update();
        PongGame.draw();

        if (!PongGame.over) requestAnimationFrame(PongGame.loop);
    },

    // Reset the turn
    _resetTurn: function (victor, loser) {
        this.ball = GameBall.create.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();

        victor.score++;
    },

    // Check if turn delay is over
    _turnDelayIsOver: function () {
        return ((new Date()).getTime() - this.timer >= 1000);
    },

    // Generate a random color for each round
    _generateRoundColor: function () {
        return GameColors[Math.floor(Math.random() * GameColors.length)];
    }
};

// Event listeners for menu buttons
document.getElementById('play-vs-computer').addEventListener('click', function () {
    PongGame.initialize('vs-computer');
    PongGame.running = true;
    window.requestAnimationFrame(PongGame.loop);
});

document.getElementById('play-2-player').addEventListener('click', function () {
    PongGame.initialize('2-player');
    PongGame.running = true;
    window.requestAnimationFrame(PongGame.loop);
});




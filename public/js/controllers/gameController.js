(function (angular) {
    angular.module('snake')
    .controller('gameController', function($scope, $interval, $document) {
        $scope.blocks = [];
        $scope.showModal = true;
        $scope.gameIsOn = true;
        $scope.gameIsPaused = false;
        var snake = [],
            egg = [],
            direction = 'right',
            newDirections = [],
            snakeMovementInterval = null,
            speed = 10,
            xSize = 20,
            ySize = 10;

        for(var i = 0 ; i < ySize ; i++) {
            $scope.blocks.push([]);
            for(var j = 0 ; j < xSize ; j++) {
                $scope.blocks[i].push({snake: false, egg: false});
            }
        }

        function initializeGame() {
            clearBoard();
            direction = 'right';
            snake = [[9,7],[9,6],[9,5],[9,4],[9,3],[9,2],[9,1],[9,0]];
            egg = [5, 10];
            printBoard();
            $scope.gameIsOn = true;
            snakeMovementInterval = startSnakeMovement();
        }

        function pause() {
            if(!$scope.gameIsOn) return;
            if(snakeMovementInterval) {
                stopSnakeMovement();
                $scope.gameIsPaused = true;
            } else {
                snakeMovementInterval = startSnakeMovement();
                $scope.gameIsPaused = false;
            }
        }

        function startSnakeMovement() {
            return $interval(moveSnake, 1000 / speed)
        }

        function stopSnakeMovement() {
            $interval.cancel(snakeMovementInterval);
            snakeMovementInterval = null;
        }

        function spawnEgg() {
            var x = ~~(Math.random() * xSize);
            var y = ~~(Math.random() * ySize);
            var eggOnSnake = false;
            snake.forEach(function(value) {
                if(angular.equals(value, [y, x])) {
                    eggOnSnake = true;
                }
            });
            if(eggOnSnake) {
                spawnEgg();
            } else {
                $scope.blocks[egg[0]][egg[1]].egg = false;
                egg = [y, x];
                $scope.blocks[y][x].egg = true;
            }
        }

        function clearBoard() {
            for(var i = 0 ; i < ySize ; i++) {
                for(var j = 0 ; j < xSize ; j++) {
                    $scope.blocks[i][j] = {snake: false, egg: false};
                }
            }
        }

        function printBoard() {
            snake.forEach(function(coords) {
                $scope.blocks[coords[0]][coords[1]].snake = true;
            });
            $scope.blocks[egg[0]][egg[1]].egg = true;
        }

        function moveSnake() {
            direction = newDirections.shift() || direction;
            switch(direction) {
                case 'up':
                    if(snake[0][0] === 0) {
                        unshiftSnake([9, snake[0][1]]);
                    } else {
                        unshiftSnake([snake[0][0] - 1, snake[0][1]]);
                    }
                    break;
                case 'down':
                    if(snake[0][0] === ySize - 1) {
                        unshiftSnake([0, snake[0][1]]);
                    } else {
                        unshiftSnake([snake[0][0] + 1, snake[0][1]]);
                    }
                    break;
                case 'left':
                    if(snake[0][1] === 0) {
                        unshiftSnake([snake[0][0], 19]);
                    } else {
                        unshiftSnake([snake[0][0], snake[0][1] - 1]);
                    }
                    break;
                case 'right':
                    if(snake[0][1] === xSize - 1) {
                        unshiftSnake([snake[0][0], 0]);
                    } else {
                        unshiftSnake([snake[0][0], snake[0][1] + 1]);
                    }
                    break;
            }
            var collisions = detectCollisions();
            if(collisions.self) {
                popSnake();
                stopSnakeMovement();
                $scope.showModal = true;
                $scope.gameIsOn = false;
            }
            else if(!collisions.egg) {
                popSnake();
            }
            else {
                spawnEgg();
            }
            printBoard();
        }

        function unshiftSnake(block) {
            snake.unshift(block);
            $scope.blocks[block[0]][block[1]].snake = true;
        }

        function popSnake() {
            var block = snake.pop();
            $scope.blocks[block[0]][block[1]].snake = false;
        }

        function detectCollisions() {
            var collisions = {self: false, egg: false};
            for(var i = 0 ; i < snake.length-1 ; i++) {
                if(snake[i][0] === egg[0] && snake[i][1] === egg[1]) {
                    collisions.egg = true;
                }
                for(var j = i+1 ; j < snake.length ; j++) {
                    if(snake[i][0] === snake[j][0] && snake[i][1] === snake[j][1]) {
                        collisions.self = true;
                        break;
                    }
                }
            }
            return collisions;
        }

        $document.bind('keydown', function(e) {
            if(!$scope.showModal && [37,38,39,40].indexOf(e.which) >= 0) {
                if(newDirections.length >= 2) {
                    newDirections = [];
                }
                var previousKeyPress = newDirections.length === 1 ? newDirections[0] : '';
                if(e.which === 38 && direction !== 'down' && previousKeyPress !== 'up') {
                    newDirections.push('up');
                }
                if(e.which === 40 && direction !== 'up' && previousKeyPress !== 'down') {
                    newDirections.push('down');
                }
                if(e.which === 37 && direction !== 'right' && previousKeyPress !== 'left') {
                    newDirections.push('left');
                }
                if(e.which === 39 && direction !== 'left' && previousKeyPress !== 'right') {
                    newDirections.push('right');
                }
            }
            else if(!$scope.showModal && e.which === 27) {
                pause();
            }
            else if($scope.showModal && e.which === 13) {
                $scope.play();
            }
        });

        $scope.getSnakesLength = function() {
            return snake.length ? snake.length - 8 : 0;
        };

        $scope.play = function() {
            $scope.showModal = false;
            initializeGame();
        };
    });
})(angular);
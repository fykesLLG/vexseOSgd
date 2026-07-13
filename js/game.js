// Модуль 5: Игровой движок, препятствия и молнии (js/game.js)
const GameEngine = {
    canvas: null,
    ctx: null,
    score: 0,
    scoreTimer: null,
    isGameOver: false,
    obstacles: [],
    spawnTimer: 0,
    obstacleSpeed: 4,
    
    // Переменные для фазы молний (после 210 очков)
    lightningPhase: false,
    lightningTimer: 0,
    warningLines: [], // Линии, которые горят красным
    activeLightningLines: [], // Линии, где бьет молния
    lightningAnimTicks: 0,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
    },

    startNewGame() {
        this.init();
        this.score = 0;
        this.isGameOver = false;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.obstacleSpeed = 5;
        
        this.lightningPhase = false;
        this.lightningTimer = 0;
        this.warningLines = [];
        this.activeLightningLines = [];
        this.lightningAnimTicks = 0;

        document.getElementById('current-score').innerText = this.score;

        // Прибавляем попытку в статистику
        let attempts = parseInt(GameStorage.get('attempts')) || 0;
        GameStorage.set('attempts', attempts + 1);
        if (typeof QuestManager !== 'undefined') QuestManager.checkQuests();

        // Инициализируем игрока под размеры холста
        Player.init(this.canvas.width, this.canvas.height);

        // Таймер: +10 очков каждую секунду
        if (this.scoreTimer) clearInterval(this.scoreTimer);
        this.scoreTimer = setInterval(() => {
            if (!this.isGameOver) {
                this.score += 10;
                document.getElementById('current-score').innerText = this.score;
                
                // Плавное ускорение обычных стен до наступления фазы молний
                if (this.score < 210) {
                    this.obstacleSpeed += 0.15;
                }
            }
        }, 1000);

        // Запуск анимационного цикла
        this.gameLoop();
    },

    gameLoop() {
        if (this.isGameOver) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    },

    update() {
        // Проверяем, какая сейчас фаза игры
        if (this.score >= 210) {
            this.lightningPhase = true;
            this.obstacles = []; // Удаляем старые стены, если остались
            this.updateLightningLogic();
        } else {
            this.updateObstaclesLogic();
        }
    },

    // Логика обычных стен (до 210 очков)
    updateObstaclesLogic() {
        this.spawnTimer++;
        
        // Частота спавна зависит от очков
        let spawnDelay = this.score < 100 ? 180 : 120; // 3 секунды или 2 секунды (при 60 FPS)

        if (this.spawnTimer >= spawnDelay) {
            this.spawnTimer = 0;
            
            if (this.score < 100) {
                // До 100 очков: просто 1 случайная линия
                let line = Math.floor(Math.random() * 3);
                this.spawnObstacleAt(line);
            } else {
                // От 100 до 210 очков: может быть 1 или 2 стены, но минимум ОДНА линия всегда открыта!
                let count = Math.random() > 0.5 ? 2 : 1;
                let lines =;
                // Перемешиваем линии
                lines.sort(() => Math.random() - 0.5);
                
                // Спавним стены только на выбранное количество (1 или 2), третья линия гарантированно пуста
                for (let i = 0; i < count; i++) {
                    this.spawnObstacleAt(lines[i]);
                }
            }
        }

        // Двигаем и проверяем столкновения стен
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.y += this.obstacleSpeed;

            // Хитбокс столкновения
            if (
                Player.currentLine === obs.line &&
                obs.y + obs.height >= Player.y &&
                obs.y <= Player.y + Player.height
            ) {
                this.gameOver();
            }

            // Удаляем улетевшие за экран стены
            if (obs.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
            }
        }
    },

    spawnObstacleAt(line) {
        const lineWidth = this.canvas.width / 3;
        this.obstacles.push({
            line: line,
            x: (lineWidth * line) + (lineWidth / 2) - 25,
            y: -60,
            width: 50,
            height: 40
        });
    },

    // Логика безумия с молниями (после 210 очков)
    updateLightningLogic() {
        this.lightningTimer++;

        // Каждые 3 секунды (180 кадров) запускаем новый цикл молний
        if (this.lightningTimer % 180 === 0) {
            this.activeLightningLines = [];
            this.lightningAnimTicks = 0;
            
            // Выбираем строго 2 случайные линии для атаки, одна ВСЕГДА безопасна
            let lines =;
            lines.sort(() => Math.random() - 0.5);
            this.warningLines = [lines[0], lines[1]];
        }

        // Через 1.5 секунды (90 кадров) после предупреждения бьет молния
        if (this.warningLines.length > 0 && this.lightningTimer % 180 === 90) {
            this.activeLightningLines = [...this.warningLines];
            this.warningLines = [];
        }

        // Если молнии активны, проверяем, не стоит ли на них игрок
        if (this.activeLightningLines.length > 0) {
            this.lightningAnimTicks++;
            
            if (this.activeLightningLines.includes(Player.currentLine)) {
                this.gameOver();
            }

            // Молния бьет в течение 0.5 секунды (30 кадров), затем исчезает
            if (this.lightningAnimTicks >= 30) {
                this.activeLightningLines = [];
            }
        }
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const lineWidth = this.canvas.width / 3;

        // 1. Отрисовка трех игровых полос
        for (let i = 0; i < 3; i++) {
            this.ctx.save();
            
            if (this.lightningPhase) {
                // В фазе молний линии белые с черным контуром
                this.ctx.fillStyle = '#111122';
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 4;
                this.ctx.fillRect(i * lineWidth, 0, lineWidth, this.canvas.height);
                this.ctx.strokeRect(i * lineWidth, -10, lineWidth, this.canvas.height + 20);

                // Если линия предупреждает (горит красным)
                if (this.warningLines.includes(i)) {
                    this.ctx.fillStyle = 'rgba(255, 0, 60, 0.35)';
                    this.ctx.fillRect(i * lineWidth, 0, lineWidth, this.canvas.height);
                }

                // Если по линии прямо сейчас херачит молния
                if (this.activeLightningLines.includes(i)) {
                    this.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
                    this.ctx.fillRect(i * lineWidth, 0, lineWidth, this.canvas.height);
                    
                    // Рисуем зигзаг молнии по центру полосы
                    this.ctx.strokeStyle = '#00ffff';
                    this.ctx.lineWidth = 5;
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = '#00ffff';
                    
                    let centerX = (i * lineWidth) + (lineWidth / 2);
                    this.ctx.beginPath();
                    this.ctx.moveTo(centerX, 0);
                    
                    for (let y = 30; y < this.canvas.height; y += 40) {
                        let deviation = (Math.random() - 0.5) * 40;
                        this.ctx.lineTo(centerX + deviation, y);
                    }
                    this.ctx.lineTo(centerX, this.canvas.height);
                    this.ctx.stroke();
                }
            } else {
                // Обычная стартовая фаза (простые неоновые разделители)
                this.ctx.strokeStyle = 'rgba(0, 255, 204, 0.15)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(i * lineWidth, 0);
                this.ctx.lineTo(i * lineWidth, this.canvas.height);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }

        // 2. Отрисовка обычных препятствий (стен)
        if (!this.lightningPhase) {
            this.ctx.fillStyle = '#ff0055';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ff0055';
            this.obstacles.forEach(obs => {
                this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            });
            this.ctx.shadowBlur = 0; // сброс свечения
        }

        // 3. Отрисовка нашего корабля-волны
        Player.draw(this.ctx);
    },

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.scoreTimer);

        // Считаем и обновляем рекорды в localStorage
        let maxRecord = parseInt(GameStorage.get('max_record')) || 0;
        let totalScore = parseInt(GameStorage.get('total_score')) || 0;

        if (this.score > maxRecord) {
            GameStorage.set('max_record', this.score);
        }
        GameStorage.set('total_score', totalScore + this.score);

        // Проверяем квесты на новые рекорды и очки
        if (typeof QuestManager !== 'undefined') {
            QuestManager.triggerScoreOnce(this.score);
            QuestManager.checkQuests();
        }

        alert(`ИГРА ОКОНЧЕНА!\nТвой результат: ${this.score} очков.`);
        
        // Возвращаемся в главное меню
        if (typeof MenuManager !== 'undefined') {
            MenuManager.switchScreen('main-menu');
        }
    }
};

// Регистрируем движок в глобальной видимости
window.GameEngine = GameEngine;

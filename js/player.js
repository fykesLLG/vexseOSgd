// Обновленный Модуль 4: Логика и управление игрока (js/player.js)
const Player = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    currentLine: 1, 
    img: null,
    isLoaded: false,

    init(canvasWidth, canvasHeight) {
        if (!this.img) {
            this.img = new Image();
            this.img.src = 'volna.png';
            this.img.onload = () => { this.isLoaded = true; };
            this.img.onerror = () => { console.log("Картинка волны не найдена, включен резерв."); };
        }
        
        this.y = canvasHeight - 120;
        this.updatePosition(canvasWidth);
        this.bindControls(canvasWidth);
    },

    updatePosition(canvasWidth) {
        const lineWidth = canvasWidth / 3;
        this.x = (lineWidth * this.currentLine) + (lineWidth / 2) - (this.width / 2);
    },

    bindControls(canvasWidth) {
        window.onkeydown = (e) => {
            if (document.getElementById('game-screen').classList.contains('hidden')) return;
            if (e.key === '1') this.currentLine = 0;
            if (e.key === '2') this.currentLine = 1;
            if (e.key === '3') this.currentLine = 2;
            this.updatePosition(canvasWidth);
        };

        const canvas = document.getElementById('gameCanvas');
        canvas.onpointerdown = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickWidth = rect.width / 3;

            if (clickX < clickWidth) this.currentLine = 0;
            else if (clickX < clickWidth * 2) this.currentLine = 1;
            else this.currentLine = 2;

            this.updatePosition(canvasWidth);
        };
    },

    draw(ctx) {
        if (this.isLoaded && this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            // Резервный неоновый куб, чтобы игра не была чёрным экраном
            ctx.fillStyle = '#00ffcc';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffcc';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
        }
    }
};

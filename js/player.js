// Модуль 4: Логика и управление игрока (js/player.js)
const Player = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    currentLine: 1, // Начинаем на центральной (второй) линии (0, 1, 2)
    img: null,
    isLoaded: false,

    init(canvasWidth, canvasHeight) {
        // Загружаем картинку волны
        this.img = new Image();
        this.img.src = 'volna.png';
        this.img.onload = () => {
            this.isLoaded = true;
        };
        
        // Высота игрока фиксирована в нижней части экрана
        this.y = canvasHeight - 120;
        
        // Обновляем X координату под текущую линию
        this.updatePosition(canvasWidth);
        
        // Включаем обработчики нажатий
        this.bindControls(canvasWidth);
    },

    // Мгновенный расчет позиции X в зависимости от выбранной линии
    updatePosition(canvasWidth) {
        const lineWidth = canvasWidth / 3;
        // Центрируем корабль ровно посредине выбранной полосы
        this.x = (lineWidth * this.currentLine) + (lineWidth / 2) - (this.width / 2);
    },

    // Управление для ПК (1, 2, 3) и мобилок (клики по полосам)
    bindControls(canvasWidth) {
        // Отвязываем старые события, чтобы не было дублей
        window.removeEventListener('keydown', this.handleKeyDown);
        
        this.handleKeyDown = (e) => {
            if (document.getElementById('game-screen').classList.contains('hidden')) return;
            
            if (e.key === '1') this.currentLine = 0;
            if (e.key === '2') this.currentLine = 1;
            if (e.key === '3') this.currentLine = 2;
            
            this.updatePosition(canvasWidth);
        };
        
        window.addEventListener('keydown', this.handleKeyDown);

        // Клик или тач по экрану: определяем, на какую из 3 полос нажал игрок
        const canvas = document.getElementById('gameCanvas');
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickWidth = rect.width / 3;

            if (clickX < clickWidth) this.currentLine = 0;
            else if (clickX < clickWidth * 2) this.currentLine = 1;
            else this.currentLine = 2;

            this.updatePosition(canvasWidth);
        };
    },

    // Отрисовка волны на холсте
    draw(ctx) {
        if (this.isLoaded) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            // Резервный вариант, если картинка jeszcze не загрузилась
            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
};

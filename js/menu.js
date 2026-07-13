// Модуль 3: Логика интерфейса и меню (js/menu.js)
const MenuManager = {
    init() {
        // Кнопки перехода в меню
        document.getElementById('btn-play').addEventListener('click', () => this.switchScreen('game-screen'));
        document.getElementById('btn-quests').addEventListener('click', () => {
            QuestManager.renderQuests();
            this.switchScreen('quests-menu');
        });
        document.getElementById('btn-profile').addEventListener('click', () => {
            this.updateProfileData();
            this.switchScreen('profile-menu');
        });

        // Кнопки возврата назад
        document.getElementById('back-from-quests').addEventListener('click', () => this.switchScreen('main-menu'));
        document.getElementById('back-from-profile').addEventListener('click', () => this.switchScreen('main-menu'));

        // Логика изменения имени игрока
        const nameInput = document.getElementById('player-name');
        nameInput.value = GameStorage.get('player_name') || 'Игрок';
        nameInput.addEventListener('input', (e) => {
            GameStorage.set('player_name', e.target.value.trim() || 'Игрок');
        });

        // Кнопка создания скриншота профиля для шеринга
        document.getElementById('btn-share').addEventListener('click', () => this.shareProfileRecord());
    },

    // Функция переключения окон
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');

        // Особая логика при старте игры
        if (screenId === 'game-screen' && typeof GameEngine !== 'undefined') {
            GameEngine.startNewGame();
        }
    },

    // Сбор свежих данных для окна профиля
    updateProfileData() {
        const statuses = JSON.parse(GameStorage.get('quests_status')) || new Array(10).fill(0);
        const completedCount = statuses.filter(s => s === 1).length;
        const totalTime = parseInt(GameStorage.get('total_time')) || 0;

        document.getElementById('prof-quests').innerText = `${completedCount}/10`;
        document.getElementById('prof-time').innerText = GameStorage.formatTime(totalTime);
        document.getElementById('prof-record').innerText = GameStorage.get('max_record') || 0;
        document.getElementById('prof-total-score').innerText = GameStorage.get('total_score') || 0;
    },

    // Магия создания автоматического скриншота профиля
    shareProfileRecord() {
        const card = document.getElementById('profile-card');
        const shareBtn = document.getElementById('btn-share');
        
        shareBtn.innerText = "ГЕНЕРАЦИЯ... ⏳";
        shareBtn.disabled = true;

        // Используем библиотеку html2canvas для отрисовки PNG
        html2canvas(card, { backgroundColor: '#0f0f1c' }).then(canvas => {
            // Скачиваем картинку
            const link = document.createElement('a');
            link.download = 'my-gd-challenge-record.png';
            link.href = canvas.toDataURL();
            link.click();

            // Копируем пригласительный текст в буфер обмена
            const gameUrl = window.location.href;
            const record = GameStorage.get('max_record') || 0;
            const textToCopy = `Смотри, я набрал рекорд ${record} в игре GD Wave Challenge! Попробуй побить мой скилл по ссылке: ${gameUrl} 🚀`;

            navigator.clipboard.writeText(textToCopy).then(() => {
                alert("Картинка профиля скачана, а текст приглашения скопирован в буфер обмена! Отправляй друзьям!");
            }).catch(() => {
                alert("Картинка профиля скачана! Ссылка на игру: " + gameUrl);
            }).finally(() => {
                shareBtn.innerText = "ПОДЕЛИТЬСЯ РЕКОРДОМ 📸";
                shareBtn.disabled = false;
            });
        });
    }
};

// Запуск меню при загрузке документа
document.addEventListener('DOMContentLoaded', () => MenuManager.init());

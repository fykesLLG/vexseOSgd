// Обновленный Модуль 3: Логика интерфейса и меню (js/menu.js)
const MenuManager = {
    init() {
        document.getElementById('btn-play').onclick = () => this.switchScreen('game-screen');
        document.getElementById('btn-quests').onclick = () => {
            if (typeof QuestManager !== 'undefined') QuestManager.renderQuests();
            this.switchScreen('quests-menu');
        };
        document.getElementById('btn-profile').onclick = () => {
            this.updateProfileData();
            this.switchScreen('profile-menu');
        };

        document.getElementById('back-from-quests').onclick = () => this.switchScreen('main-menu');
        document.getElementById('back-from-profile').onclick = () => this.switchScreen('main-menu');

        const nameInput = document.getElementById('player-name');
        nameInput.value = GameStorage.get('player_name') || 'Игрок';
        nameInput.oninput = (e) => {
            GameStorage.set('player_name', e.target.value.trim() || 'Игрок');
        };

        document.getElementById('btn-share').onclick = () => this.shareProfileRecord();
    },

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');

        if (screenId === 'game-screen' && window.GameEngine) {
            window.GameEngine.startNewGame();
        }
    },

    updateProfileData() {
        const statuses = JSON.parse(GameStorage.get('quests_status')) || new Array(10).fill(0);
        const completedCount = statuses.filter(s => s === 1).length;
        const totalTime = parseInt(GameStorage.get('total_time')) || 0;

        document.getElementById('prof-quests').innerText = `${completedCount}/10`;
        document.getElementById('prof-time').innerText = GameStorage.formatTime(totalTime);
        document.getElementById('prof-record').innerText = GameStorage.get('max_record') || 0;
        document.getElementById('prof-total-score').innerText = GameStorage.get('total_score') || 0;
    },

    shareProfileRecord() {
        const card = document.getElementById('profile-card');
        const shareBtn = document.getElementById('btn-share');
        
        shareBtn.innerText = "ГЕНЕРАЦИЯ... ⏳";
        shareBtn.disabled = true;

        // Фикс зависания html2canvas: убираем фокус с инпута перед снимком
        document.getElementById('player-name').blur();

        setTimeout(() => {
            html2canvas(card, { 
                backgroundColor: '#0f0f1c',
                logging: false,
                useCORS: true
            }).then(canvas => {
                try {
                    const link = document.createElement('a');
                    link.download = 'my-record.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } catch(e) {
                    console.log("Прямое скачивание недоступно, открываем в окне");
                }

                const gameUrl = window.location.href.split('?')[0];
                const record = GameStorage.get('max_record') || 0;
                const textToCopy = `Сыграй в нашу игру и побей мой рекорд ${record}! Ссылка: ${gameUrl}`;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert("Рекорд скопирован в буфер обмена, а скриншот сохранен!");
                }).catch(() => {
                    alert("Сыграй в нашу игру! Ссылка: " + gameUrl);
                }).finally(() => {
                    shareBtn.innerText = "ПОДЕЛИТЬСЯ РЕКОРДОМ 📸";
                    shareBtn.disabled = false;
                });
            }).catch(err => {
                alert("Ошибка генерации. Ссылка на игру: " + window.location.href);
                shareBtn.innerText = "ПОДЕЛИТЬСЯ РЕКОРДОМ 📸";
                shareBtn.disabled = false;
            });
        }, 100);
    }
};

document.addEventListener('DOMContentLoaded', () => MenuManager.init());
if (document.readyState === "complete" || document.readyState === "interactive") {
    MenuManager.init();
}

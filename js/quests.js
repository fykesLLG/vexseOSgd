// Модуль 2: Список и логика 10 заданий (js/quests.js)
const QUESTS_DATA = [
    { id: 1, text: "Играй в игру в сумме 30 минут", goal: 1800, type: "time" },
    { id: 2, text: "Сделай 10 попыток", goal: 10, type: "attempts" },
    { id: 3, text: "Пройди на 10 очков (в одной попытке)", goal: 10, type: "score_once" },
    { id: 4, text: "В сумме набери 100 очков", goal: 100, type: "total_score" },
    { id: 5, text: "В сумме набери 1000 очков", goal: 1000, type: "total_score" },
    { id: 6, text: "В сумме набери 10000 очков", goal: 10000, type: "total_score" },
    { id: 7, text: "Заходи в игру каждый день на протяжении 3 дней", goal: 3, type: "streak" },
    { id: 8, text: "Дойди до рекорда 100", goal: 100, type: "record" },
    { id: 9, text: "Дойди до рекорда 1000", goal: 1000, type: "record" },
    { id: 10, text: "Выполни задания 1-9", goal: 9, type: "master" }
];

const QuestManager = {
    // Отрисовка списка квестов в меню
    renderQuests() {
        const container = document.getElementById('quests-container');
        if (!container) return;
        
        container.innerHTML = '';
        const statuses = JSON.parse(GameStorage.get('quests_status')) || new Array(10).fill(0);
        let completedCount = 0;

        QUESTS_DATA.forEach((quest, index) => {
            const isCompleted = statuses[index] === 1;
            if (isCompleted) completedCount++;

            let progress = 0;
            if (quest.type === "time") progress = Math.floor((parseInt(GameStorage.get('total_time')) || 0) / 60) + " мин";
            else if (quest.type === "attempts") progress = GameStorage.get('attempts') || 0;
            else if (quest.type === "score_once") progress = isCompleted ? 10 : 0;
            else if (quest.type === "total_score") progress = GameStorage.get('total_score') || 0;
            else if (quest.type === "streak") progress = localStorage.getItem('gd_login_streak') || 1;
            else if (quest.type === "record") progress = GameStorage.get('max_record') || 0;
            else if (quest.type === "master") progress = statuses.slice(0, 9).filter(s => s === 1).length;

            const item = document.createElement('div');
            item.className = `quest-item ${isCompleted ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="quest-text">
                    <strong>№${quest.id}:</strong> ${quest.text}
                    <div style="font-size: 11px; color: #555c73; margin-top: 2px;">
                        Текущий прогресс: ${progress} / ${quest.type === "time" ? "30 мин" : quest.goal}
                    </div>
                </div>
                <div class="quest-status">${isCompleted ? 'ВЫПОЛНЕНО' : 'В ПРОЦЕССЕ'}</div>
            `;
            container.appendChild(item);
        });

        document.getElementById('completed-count').innerText = completedCount;
        
        const profQuests = document.getElementById('prof-quests');
        if (profQuests) profQuests.innerText = `${completedCount}/10`;
    },

    // Математическая проверка всех условий
    checkQuests() {
        let statuses = JSON.parse(GameStorage.get('quests_status')) || new Array(10).fill(0);
        
        const totalTime = parseInt(GameStorage.get('total_time')) || 0;
        const attempts = parseInt(GameStorage.get('attempts')) || 0;
        const totalScore = parseInt(GameStorage.get('total_score')) || 0;
        const record = parseInt(GameStorage.get('max_record')) || 0;
        const streak = parseInt(localStorage.getItem('gd_login_streak')) || 1;

        if (totalTime >= QUESTS_DATA[0].goal) statuses[0] = 1;
        if (attempts >= QUESTS_DATA[1].goal) statuses[1] = 1;
        if (totalScore >= QUESTS_DATA[3].goal) statuses[3] = 1;
        if (totalScore >= QUESTS_DATA[4].goal) statuses[4] = 1;
        if (totalScore >= QUESTS_DATA[5].goal) statuses[5] = 1;
        if (streak >= QUESTS_DATA[6].goal) statuses[6] = 1;
        if (record >= QUESTS_DATA[7].goal) statuses[7] = 1;
        if (record >= QUESTS_DATA[8].goal) statuses[8] = 1;

        // Финальный квест №10
        const firstNineCompleted = statuses.slice(0, 9).every(status => status === 1);
        if (firstNineCompleted) statuses[9] = 1;

        GameStorage.set('quests_status', JSON.stringify(statuses));
    },

    checkTimeQuests(totalTime) {
        let statuses = JSON.parse(GameStorage.get('quests_status')) || new Array(10).fill(0);
        if (statuses[0] === 0 && totalTime >= QUESTS_DATA[0].goal) {
            statuses[0] = 1;
            GameStorage.set('quests_status', JSON.stringify(statuses));
            this.checkQuests();
        }
    },

    triggerScoreOnce(score) {
        let statuses = JSON.parse(GameStorage.get('quests_status')) || new Array(10).fill(0);
        if (score === 10) {
            statuses[2] = 1;
            GameStorage.set('quests_status', JSON.stringify(statuses));
            this.checkQuests();
        }
    }
};

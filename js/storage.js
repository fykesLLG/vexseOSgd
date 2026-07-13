// Модуль 1: База данных и сохранение статистики (js/storage.js)
const GameStorage = {
    init() {
        // Забиваем стартовые данные, если игрок зашел впервые
        if (!localStorage.getItem('gd_player_name')) localStorage.setItem('gd_player_name', 'Игрок');
        if (!localStorage.getItem('gd_max_record')) localStorage.setItem('gd_max_record', '0');
        if (!localStorage.getItem('gd_total_score')) localStorage.setItem('gd_total_score', '0');
        if (!localStorage.getItem('gd_total_time')) localStorage.setItem('gd_total_time', '0');
        if (!localStorage.getItem('gd_attempts')) localStorage.setItem('gd_attempts', '0');
        
        // Массив квестов (0 - не сделан, 1 - сделан)
        if (!localStorage.getItem('gd_quests_status')) {
            localStorage.setItem('gd_quests_status', JSON.stringify(new Array(10).fill(0)));
        }
        
        this.checkDailyStreak();
        this.startTimeCounter();
    },

    get(key) {
        return localStorage.getItem('gd_' + key);
    },

    set(key, value) {
        localStorage.setItem('gd_' + key, value);
    },

    // Каждую секунду на сайте прибавляем +1 к общему времени
    startTimeCounter() {
        setInterval(() => {
            let totalTime = parseInt(this.get('total_time')) || 0;
            totalTime++;
            this.set('total_time', totalTime);
            
            // Если открыт профиль, обновляем время прямо на глазах
            const timeEl = document.getElementById('prof-time');
            if (timeEl && !document.getElementById('profile-menu').classList.contains('hidden')) {
                timeEl.innerText = this.formatTime(totalTime);
            }
            
            if (typeof QuestManager !== 'undefined' && QuestManager.checkTimeQuests) {
                QuestManager.checkTimeQuests(totalTime);
            }
        }, 1000);
    },

    formatTime(seconds) {
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        return m > 0 ? `${m}м ${s}с` : `${s} сек`;
    },

    // Считаем дни заходов для квеста №7
    checkDailyStreak() {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('gd_last_login_date');
        let streak = parseInt(localStorage.getItem('gd_login_streak')) || 1;

        if (lastLogin && lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastLogin === yesterday.toDateString()) {
                streak++;
                localStorage.setItem('gd_login_streak', streak.toString());
            } else {
                localStorage.setItem('gd_login_streak', '1');
            }
        }
        localStorage.setItem('gd_last_login_date', today);
    }
};

GameStorage.init();

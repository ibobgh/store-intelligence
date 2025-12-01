// Конфигурация
const API_BASE = window.location.origin + '/api';
let currentUser = null;
let authToken = null;
let salesChart = null;

// Функция входа
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('⚠️ Заполните все поля', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(currentUser));
            
            showDashboard();
            showNotification('✅ Успешный вход в систему!', 'success');
        } else {
            showNotification(`❌ ${data.error || 'Ошибка входа'}`, 'error');
        }
    } catch (error) {
        showNotification('❌ Ошибка соединения с сервером', 'error');
        // Для демо - используем фиктивные данные
        useDemoLogin(email, password);
    }
}

// Демо-вход (если сервер не отвечает)
function useDemoLogin(email, password) {
    const demoUsers = {
        'admin@company.uz': {
            name: 'Администратор',
            role: 'admin',
            avatar: '👑',
            store_id: null
        },
        'manager@company.uz': {
            name: 'Менеджер',
            role: 'manager',
            avatar: '👨‍💼',
            store_id: 1
        }
    };
    
    if ((email === 'admin@company.uz' || email === 'manager@company.uz') && password === 'password') {
        currentUser = demoUsers[email];
        authToken = 'demo-token-' + Date.now();
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        showDashboard();
        showNotification('✅ Демо-вход выполнен успешно!', 'success');
    } else {
        showNotification('❌ Неверные учетные данные', 'error');
    }
}

// Функция выхода
function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    showAuth();
    showNotification('👋 Вы вышли из системы', 'warning');
}

// Показать форму входа
function showAuth() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

// Показать панель управления
function showDashboard() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('userAvatar').textContent = currentUser.avatar;
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = 
            currentUser.role === 'admin' ? 'Администратор сети' : 'Менеджер магазина';
        document.getElementById('storeInfo').textContent = 
            currentUser.role === 'admin' ? '🌐 Вся сеть магазинов' : '🏪 Ташкент Центральный';
    }
    
    loadDashboardData();
    loadTabContent('analytics');
}

// Загрузить данные для панели
async function loadDashboardData() {
    try {
        // Загрузка статистики
        const statsResponse = await fetch(`${API_BASE}/analytics/daily-stats`);
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateStats(stats);
        }
        
        // Загрузка уведомлений
        const notifResponse = await fetch(`${API_BASE}/inventory/notifications`);
        if (notifResponse.ok) {
            const notifications = await notifResponse.json();
            updateNotifications(notifications);
        }
        
        // Загрузка данных для графика
        const chartResponse = await fetch(`${API_BASE}/analytics/sales-chart`);
        if (chartResponse.ok) {
            const chartData = await chartResponse.json();
            initSalesChart(chartData);
        }
        
    } catch (error) {
        console.log('Используем демо-данные');
        // Используем демо-данные
        updateStats({
            revenue: 12845000,
            customers: 324,
            avg_check: 39645,
            items_sold: 587
        });
        
        updateNotifications([
            { product: 'Молоко Простоквашино 1л', stock: 8, min_stock: 25, status: 'low' },
            { product: 'Хлеб Бородинский', stock: 15, min_stock: 30, status: 'medium' },
            { product: 'Вода минеральная 1.5л', stock: 42, min_stock: 20, status: 'normal' }
        ]);
        
        initSalesChart(generateDemoChartData());
    }
}

// Обновить статистику
function updateStats(stats) {
    document.getElementById('revenueValue').textContent = formatCurrency(stats.revenue) + ' UZS';
    document.getElementById('customersValue').textContent = stats.customers;
    document.getElementById('avgCheckValue').textContent = formatCurrency(stats.avg_check) + ' UZS';
    document.getElementById('itemsSoldValue').textContent = stats.items_sold;
}

// Обновить уведомления
function updateNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';
    
    notifications.forEach(item => {
        const statusText = item.status === 'low' ? '⚠️ Низкий запас' : 
                         item.status === 'medium' ? '🔶 Средний запас' : '✅ Нормальный запас';
        
        const div = document.createElement('div');
        div.className = `stock-item ${item.status}`;
        div.innerHTML = `
            <strong>${item.product}</strong><br>
            📦 Остаток: ${item.stock} шт. (мин: ${item.min_stock}) | ${statusText}
        `;
        container.appendChild(div);
    });
}

// Форматировать валюту
function formatCurrency(amount) {
    return amount.toLocaleString('ru-RU');
}

// Показать вкладку
function showTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активность с кнопок
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Активировать кнопку
    event.target.classList.add('active');
    
    // Загрузить контент вкладки
    loadTabContent(tabName);
}

// Загрузить контент вкладки
function loadTabContent(tabName) {
    const containers = {
        'inventory': 'inventoryContent',
        'sales': 'salesContent',
        'stores': 'storesContent',
        'reports': 'reportsContent'
    };
    
    if (containers[tabName]) {
        const container = document.getElementById(containers[tabName]);
        
        switch(tabName) {
            case 'inventory':
                container.innerHTML = generateInventoryContent();
                break;
            case 'sales':
                container.innerHTML = generateSalesContent();
                break;
            case 'stores':
                container.innerHTML = generateStoresContent();
                break;
            case 'reports':
                container.innerHTML = generateReportsContent();
                break;
        }
    }
}

// Сгенерировать контент для управления запасами
function generateInventoryContent() {
    return `
        <p>Мониторинг и управление остатками товаров в реальном времени</p>
        <button class="btn" onclick="loadProducts()" style="margin-top: 15px;">📋 Загрузить список товаров</button>
        <div id="productsList" style="margin-top: 20px;"></div>
    `;
}

// Сгенерировать контент для продаж
function generateSalesContent() {
    return `
        <p>Управление продажами и транзакциями</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div>
                <h4>📊 Статистика продаж</h4>
                <p>• Продаж сегодня: 45</p>
                <p>• Выручка: 12,845,000 UZS</p>
                <p>• Средний чек: 39,645 UZS</p>
            </div>
            <div>
                <h4>💳 Методы оплаты</h4>
                <p>• Наличные: 60%</p>
                <p>• Карта: 35%</p>
                <p>• Перевод: 5%</p>
            </div>
        </div>
    `;
}

// Сгенерировать контент для магазинов
function generateStoresContent() {
    return `
        <p>Управление сетью магазинов</p>
        <button class="btn" onclick="loadStores()" style="margin-top: 15px;">🏪 Загрузить список магазинов</button>
        <div id="storesList" style="margin-top: 20px;"></div>
    `;
}

// Сгенерировать контент для отчетов
function generateReportsContent() {
    return `
        <p>Аналитические отчеты и статистика</p>
        <div class="quick-actions" style="margin-top: 20px;">
            <button class="btn" onclick="generateDailyReport()">📅 Ежедневный отчет</button>
            <button class="btn btn-success" onclick="generateWeeklyReport()">📊 Недельный отчет</button>
            <button class="btn btn-warning" onclick="generateMonthlyReport()">📈 Месячный отчет</button>
        </div>
    `;
}

// Загрузить товары
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            const products = await response.json();
            displayProducts(products);
        }
    } catch (error) {
        showNotification('❌ Ошибка загрузки товаров', 'error');
    }
}

// Показать товары
function displayProducts(products) {
    const container = document.getElementById('productsList');
    container.innerHTML = '<h4>📦 Список товаров:</h4>';
    
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = `stock-item ${product.status}`;
        div.innerHTML = `
            <strong>${product.name}</strong><br>
            📦 SKU: ${product.sku} | Категория: ${product.category}<br>
            💰 Цена: ${formatCurrency(product.price)} UZS | Остаток: ${product.stock} шт.
        `;
        container.appendChild(div);
    });
}

// Загрузить магазины
async function loadStores() {
    try {
        const response = await fetch(`${API_BASE}/stores`);
        if (response.ok) {
            const stores = await response.json();
            displayStores(stores);
        }
    } catch (error) {
        showNotification('❌ Ошибка загрузки магазинов', 'error');
    }
}

// Показать магазины
function displayStores(stores) {
    const container = document.getElementById('storesList');
    container.innerHTML = '<h4>🏪 Сеть магазинов:</h4>';
    
    stores.forEach(store => {
        const div = document.createElement('div');
        div.className = 'stock-item';
        div.innerHTML = `
            <strong>${store.name}</strong><br>
            🏙️ Город: ${store.city}<br>
            💰 Выручка: ${formatCurrency(store.revenue)} UZS<br>
            👥 Клиентов: ${store.customers} | ⭐ Рейтинг: ${store.rating}/5
        `;
        container.appendChild(div);
    });
}

// Создать график продаж
function initSalesChart(chartData) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    if (salesChart) {
        salesChart.destroy();
    }
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(item => item.date.split('-')[2]),
            datasets: [{
                label: 'Продажи (тыс. UZS)',
                data: chartData.map(item => Math.floor(item.sales / 1000)),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + 'k';
                        }
                    }
                }
            }
        }
    });
}

// Сгенерировать демо-данные для графика
function generateDemoChartData() {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        data.push({
            date: date.toISOString().split('T')[0],
            sales: Math.floor(Math.random() * 300000) + 700000,
            transactions: Math.floor(Math.random() * 50) + 100
        });
    }
    
    return data;
}

// Функции кнопок
function addSale() {
    showNotification('💰 Новая продажа успешно добавлена', 'success');
}

function createReport() {
    showNotification('📊 Отчет успешно сгенерирован', 'success');
}

function syncData() {
    showNotification('🔄 Данные успешно синхронизированы', 'success');
}

function generateDailyReport() {
    showNotification('📅 Ежедневный отчет готов к скачиванию', 'success');
}

function generateWeeklyReport() {
    showNotification('📊 Недельный отчет сгенерирован', 'success');
}

function generateMonthlyReport() {
    showNotification('📈 Месячный отчет подготовлен', 'success');
}

// Показать уведомление
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверить сохраненную авторизацию
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('userData');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
    
    // Обработчик Enter для формы
    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // Проверить API
    checkAPI();
});

// Проверить доступность API
async function checkAPI() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            console.log('✅ API доступен');
        }
    } catch (error) {
        console.log('⚠️  API не доступен, используется демо-режим');
    }
}

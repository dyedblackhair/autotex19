const DB = {
  getUsers: () => JSON.parse(localStorage.getItem('atx_users') || '[]'),
  setUsers: (u) => localStorage.setItem('atx_users', JSON.stringify(u)),
  getAdmins: () => JSON.parse(localStorage.getItem('atx_admins') || '[]'),
  setAdmins: (a) => localStorage.setItem('atx_admins', JSON.stringify(a)),
  getOrders: () => JSON.parse(localStorage.getItem('atx_orders') || '[]'),
  setOrders: (o) => localStorage.setItem('atx_orders', JSON.stringify(o)),
  getProducts: () => JSON.parse(localStorage.getItem('atx_products') || '[]'),
  setProducts: (p) => localStorage.setItem('atx_products', JSON.stringify(p)),
  getRequests: () => JSON.parse(localStorage.getItem('atx_requests') || '[]'),
  setRequests: (r) => localStorage.setItem('atx_requests', JSON.stringify(r)),
  getCurrentUser: () => JSON.parse(localStorage.getItem('atx_current_user') || 'null'),
  setCurrentUser: (u) => localStorage.setItem('atx_current_user', JSON.stringify(u)),
  getCurrentAdmin: () => JSON.parse(localStorage.getItem('atx_current_admin') || 'null'),
  setCurrentAdmin: (a) => localStorage.setItem('atx_current_admin', JSON.stringify(a)),
};

function initDemoData() {
  if (DB.getProducts().length === 0) {
    DB.setProducts([
      { id: 1, name: 'Чехлы «Премиум»', category: 'ecoleather', price: 12900, status: 'active' },
      { id: 2, name: 'Чехлы «Спорт»', category: 'ecoleather', price: 14500, status: 'active' },
      { id: 3, name: 'Чехлы «Алькантара Люкс»', category: 'alcantara', price: 24900, status: 'active' },
      { id: 4, name: 'Гибкий мрамор «Каррара»', category: 'marble', price: 2100, status: 'active' },
      { id: 5, name: 'Чехлы «Комфорт»', category: 'ecoleather', price: 8900, status: 'active' },
      { id: 6, name: 'Гибкий мрамор «Оникс»', category: 'marble', price: 2400, status: 'active' },
    ]);
  }
  if (DB.getOrders().length === 0) {
    DB.setOrders([
      { id: 1001, client: 'Иван Петров', product: 'Чехлы «Премиум»', amount: 12900, status: 'done', date: '2026-06-15' },
      { id: 1002, client: 'Мария Сидорова', product: 'Алькантара Люкс', amount: 24900, status: 'processing', date: '2026-06-17' },
      { id: 1003, client: 'Алексей Козлов', product: 'Гибкий мрамор Каррара', amount: 4200, status: 'new', date: '2026-06-19' },
    ]);
  }
  if (DB.getRequests().length === 0) {
    DB.setRequests([
      { id: 1, name: 'Дмитрий Волков', phone: '+7 (999) 123-45-67', message: 'Интересует пошив чехлов на BMW X5', date: '2026-06-18', status: 'new' },
      { id: 2, name: 'Елена Морозова', phone: '+7 (916) 555-44-33', message: 'Хочу заказать отделку гибким мрамором', date: '2026-06-19', status: 'new' },
    ]);
  }
  if (DB.getUsers().length === 0) {
    DB.setUsers([
      { id: 1, name: 'Иван Петров', email: 'ivan@mail.ru', phone: '+7 (999) 111-22-33', password: '123456', city: 'Москва', address: 'ул. Ленина, 10', registered: '2026-05-10' },
    ]);
  }
}
initDemoData();
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.auth-tabs').forEach(tabs => {
    tabs.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const parent = tabs.parentElement;
        parent.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        parent.querySelector(`#${target}Form, #${target.replace('-', '')}Form`)?.classList.add('active');
        const forms = parent.querySelectorAll('.auth-form');
        forms.forEach(f => {
          if (f.id.toLowerCase().includes(target.replace('-', ''))) f.classList.add('active');
        });
      });
    });
  });
});

function logout() {
  if (confirm('Выйти из аккаунта?')) {
    localStorage.removeItem('atx_current_user');
    window.location.href = 'login.html';
  }
}

document.querySelectorAll('.phone-input').forEach(input => {
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('7') || v.startsWith('8')) v = v.substring(1);
    let f = '+7';
    if (v.length > 0) f += ' (' + v.substring(0, 3);
    if (v.length >= 3) f += ') ' + v.substring(3, 6);
    if (v.length >= 6) f += '-' + v.substring(6, 8);
    if (v.length >= 8) f += '-' + v.substring(8, 10);
    e.target.value = f;
  });
});

document.getElementById('registerForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const err = document.getElementById('registerError');
  const suc = document.getElementById('registerSuccess');
  err.style.display = 'none'; suc.style.display = 'none';

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value;
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;

  if (password !== password2) {
    err.textContent = 'Пароли не совпадают';
    err.style.display = 'block';
    return;
  }

  const users = DB.getUsers();
  if (users.find(u => u.email === email)) {
    err.textContent = 'Пользователь с таким email уже существует';
    err.style.display = 'block';
    return;
  }

  const newUser = {
    id: Date.now(),
    name, email, phone, password,
    city: '', address: '',
    registered: new Date().toISOString().split('T')[0]
  };
  users.push(newUser);
  DB.setUsers(users);
  DB.setCurrentUser(newUser);

  suc.textContent = 'Регистрация успешна! Перенаправляем в личный кабинет...';
  suc.style.display = 'block';
  setTimeout(() => window.location.href = 'profile.html', 1200);
});

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const err = document.getElementById('loginError');
  err.style.display = 'none';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const user = DB.getUsers().find(u => u.email === email && u.password === password);
  if (!user) {
    err.textContent = 'Неверный email или пароль';
    err.style.display = 'block';
    return;
  }

  DB.setCurrentUser(user);
  window.location.href = 'profile.html';
});

if (document.getElementById('loginForm') && DB.getCurrentUser()) {
  window.location.href = 'profile.html';
}
if (document.getElementById('adminLoginForm') && DB.getCurrentAdmin()) {
  window.location.href = 'admin.html';
}

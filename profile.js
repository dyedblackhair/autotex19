(function() {
  const user = DB.getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }

  // Заполняем данные
  document.getElementById('profileTitle').textContent = `Привет, ${user.name.split(' ')[0]}!`;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileAvatar').textContent = user.name.charAt(0).toUpperCase();

  document.getElementById('editName').value = user.name || '';
  document.getElementById('editEmail').value = user.email || '';
  document.getElementById('editPhone').value = user.phone || '';
  document.getElementById('editCity').value = user.city || '';
  document.getElementById('editAddress').value = user.address || '';

  // Навигация
  document.querySelectorAll('.profile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
      document.getElementById('section-' + btn.dataset.section).classList.add('active');
    });
  });

  // Заказы
  renderOrders();

  function renderOrders() {
    const orders = DB.getOrders().filter(o => o.userId === user.id || o.client === user.name);
    const list = document.getElementById('ordersList');
    document.getElementById('ordersCount').textContent = `${orders.length} ${pluralize(orders.length, 'заказ', 'заказа', 'заказов')}`;
    
    if (orders.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-secondary);">
        <div style="font-size:3rem; margin-bottom:12px;">📦</div>
        <p>У вас пока нет заказов</p>
        <a href="catalog.html" class="btn btn-primary" style="margin-top:16px;">Перейти в каталог</a>
      </div>`;
      return;
    }
    
    list.innerHTML = orders.map(o => `
      <div class="order-item">
        <div class="order-item-info">
          <h4>Заказ #${o.id} — ${o.product}</h4>
          <div class="order-item-meta">${o.date} · ${formatPrice(o.amount)}</div>
        </div>
        <span class="order-status status-${o.status}">${statusLabel(o.status)}</span>
      </div>
    `).join('');
  }

  // Сохранение профиля
  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    
    users[idx] = {
      ...users[idx],
      name: document.getElementById('editName').value,
      email: document.getElementById('editEmail').value,
      phone: document.getElementById('editPhone').value,
      city: document.getElementById('editCity').value,
      address: document.getElementById('editAddress').value,
    };
    DB.setUsers(users);
    DB.setCurrentUser(users[idx]);
    
    document.getElementById('profileName').textContent = users[idx].name;
    document.getElementById('profileEmail').textContent = users[idx].email;
    document.getElementById('profileAvatar').textContent = users[idx].name.charAt(0).toUpperCase();
    
    const s = document.getElementById('profileSuccess');
    s.style.display = 'block';
    setTimeout(() => s.style.display = 'none', 3000);
  });

  // Смена пароля
  document.getElementById('passwordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const err = document.getElementById('passwordError');
    const suc = document.getElementById('passwordSuccess');
    err.style.display = 'none'; suc.style.display = 'none';
    
    const oldP = document.getElementById('oldPassword').value;
    const newP = document.getElementById('newPassword').value;
    const newP2 = document.getElementById('newPassword2').value;
    
    if (oldP !== user.password) { err.textContent = 'Неверный текущий пароль'; err.style.display = 'block'; return; }
    if (newP !== newP2) { err.textContent = 'Пароли не совпадают'; err.style.display = 'block'; return; }
    
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    users[idx].password = newP;
    DB.setUsers(users);
    DB.setCurrentUser(users[idx]);
    
    e.target.reset();
    suc.style.display = 'block';
    setTimeout(() => suc.style.display = 'none', 3000);
  });
})();

// ===== Утилиты =====
function formatPrice(p) { return new Intl.NumberFormat('ru-RU').format(p) + ' ₽'; }
function statusLabel(s) {
  return { new: 'Новый', processing: 'В работе', done: 'Выполнен', cancelled: 'Отменён' }[s] || s;
}
function pluralize(n, one, two, five) {
  let f = Math.abs(n) % 100, n1 = f % 10;
  if (f > 10 && f < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}
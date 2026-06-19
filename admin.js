(function() {
  const admin = DB.getCurrentAdmin();
  if (!admin) { window.location.href = 'admin-login.html'; return; }

  document.getElementById('adminName').textContent = admin.username;
  document.getElementById('adminUsername').textContent = admin.email;
  document.getElementById('adminAvatar').textContent = admin.username.charAt(0).toUpperCase();
  const titles = {
    dashboard: 'Дашборд', orders: 'Заказы', products: 'Товары',
    requests: 'Заявки', clients: 'Клиенты'
  };
  document.querySelectorAll('.admin-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      document.getElementById('admin-' + btn.dataset.section).classList.add('active');
      document.getElementById('adminPageTitle').textContent = titles[btn.dataset.section];
      renderSection(btn.dataset.section);
    });
  });

  function renderDashboard() {
    document.getElementById('statOrders').textContent = DB.getOrders().length;
    document.getElementById('statProducts').textContent = DB.getProducts().length;
    document.getElementById('statRequests').textContent = DB.getRequests().length;
    document.getElementById('statClients').textContent = DB.getUsers().length;

    const recentOrders = DB.getOrders().slice(-3).reverse();
    document.getElementById('recentOrders').innerHTML = recentOrders.length
      ? recentOrders.map(o => `
        <div class="order-item">
          <div class="order-item-info">
            <h4>#${o.id} · ${o.client}</h4>
            <div class="order-item-meta">${o.product} · ${formatPrice(o.amount)}</div>
          </div>
          <span class="order-status status-${o.status}">${statusLabel(o.status)}</span>
        </div>`).join('')
      : '<p class="text-secondary">Нет заказов</p>';

    const recentReqs = DB.getRequests().slice(-3).reverse();
    document.getElementById('recentRequests').innerHTML = recentReqs.length
      ? recentReqs.map(r => `
        <div class="order-item">
          <div class="order-item-info">
            <h4>${r.name}</h4>
            <div class="order-item-meta">${r.phone} · ${r.date}</div>
          </div>
          <span class="order-status status-${r.status === 'new' ? 'new' : 'done'}">${r.status === 'new' ? 'Новая' : 'Обработана'}</span>
        </div>`).join('')
      : '<p class="text-secondary">Нет заявок</p>';
  }

  function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    const orders = DB.getOrders();
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">Нет заказов</td></tr>';
      return;
    }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.client}</td>
        <td>${o.product}</td>
        <td><strong>${formatPrice(o.amount)}</strong></td>
        <td><span class="order-status status-${o.status}">${statusLabel(o.status)}</span></td>
        <td>${o.date}</td>
        <td class="actions">
          <button onclick="editOrder(${o.id})">✏️</button>
          <button class="btn-delete" onclick="deleteOrder(${o.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  window.openOrderModal = function(order = null) {
    document.getElementById('orderModalTitle').textContent = order ? 'Редактировать заказ' : 'Новый заказ';
    document.getElementById('orderId').value = order?.id || '';
    document.getElementById('orderClient').value = order?.client || '';
    document.getElementById('orderProduct').value = order?.product || '';
    document.getElementById('orderAmount').value = order?.amount || '';
    document.getElementById('orderStatus').value = order?.status || 'new';
    document.getElementById('orderModal').classList.add('active');
  };

  window.editOrder = function(id) {
    const o = DB.getOrders().find(x => x.id === id);
    if (o) openOrderModal(o);
  };

  window.deleteOrder = function(id) {
    if (!confirm('Удалить заказ?')) return;
    DB.setOrders(DB.getOrders().filter(o => o.id !== id));
    renderOrders();
    renderDashboard();
  };

  document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('orderId').value;
    const orders = DB.getOrders();
    const data = {
      client: document.getElementById('orderClient').value,
      product: document.getElementById('orderProduct').value,
      amount: +document.getElementById('orderAmount').value,
      status: document.getElementById('orderStatus').value,
      date: new Date().toISOString().split('T')[0]
    };
    if (id) {
      const idx = orders.findIndex(o => o.id === +id);
      orders[idx] = { ...orders[idx], ...data };
    } else {
      data.id = Date.now();
      data.userId = null;
      orders.push(data);
    }
    DB.setOrders(orders);
    closeModal('orderModal');
    renderOrders();
    renderDashboard();
  });

  function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    const products = DB.getProducts();
    const catNames = { ecoleather: 'Экокожа', alcantara: 'Алькантара', marble: 'Гибкий мрамор' };
    tbody.innerHTML = products.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${catNames[p.category] || p.category}</td>
        <td>${formatPrice(p.price)}</td>
        <td><span class="order-status status-${p.status === 'active' ? 'done' : 'cancelled'}">${p.status === 'active' ? 'Активен' : 'Скрыт'}</span></td>
        <td class="actions">
          <button onclick="editProduct(${p.id})">✏️</button>
          <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  window.openProductModal = function(p = null) {
    document.getElementById('productModalTitle').textContent = p ? 'Редактировать товар' : 'Новый товар';
    document.getElementById('productId').value = p?.id || '';
    document.getElementById('productName').value = p?.name || '';
    document.getElementById('productCategory').value = p?.category || 'ecoleather';
    document.getElementById('productPrice').value = p?.price || '';
    document.getElementById('productStatus').value = p?.status || 'active';
    document.getElementById('productModal').classList.add('active');
  };

  window.editProduct = function(id) {
    const p = DB.getProducts().find(x => x.id === id);
    if (p) openProductModal(p);
  };

  window.deleteProduct = function(id) {
    if (!confirm('Удалить товар?')) return;
    DB.setProducts(DB.getProducts().filter(p => p.id !== id));
    renderProducts();
    renderDashboard();
  };

  document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const products = DB.getProducts();
    const data = {
      name: document.getElementById('productName').value,
      category: document.getElementById('productCategory').value,
      price: +document.getElementById('productPrice').value,
      status: document.getElementById('productStatus').value,
    };
    if (id) {
      const idx = products.findIndex(p => p.id === +id);
      products[idx] = { ...products[idx], ...data };
    } else {
      data.id = Date.now();
      products.push(data);
    }
    DB.setProducts(products);
    closeModal('productModal');
    renderProducts();
    renderDashboard();
  });

  let requestFilter = 'all';
  function renderRequests() {
    const tbody = document.getElementById('requestsTableBody');
    let reqs = DB.getRequests();
    if (requestFilter !== 'all') reqs = reqs.filter(r => r.status === requestFilter);
    
    if (reqs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-secondary);">Нет заявок</td></tr>';
      return;
    }
    tbody.innerHTML = reqs.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.phone}</td>
        <td style="max-width:300px;">${r.message}</td>
        <td>${r.date}</td>
        <td><span class="order-status status-${r.status === 'new' ? 'new' : 'done'}">${r.status === 'new' ? 'Новая' : 'Обработана'}</span></td>
        <td class="actions">
          ${r.status === 'new' ? `<button onclick="processRequest(${r.id})">✓ Обработать</button>` : ''}
          <button class="btn-delete" onclick="deleteRequest(${r.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  window.processRequest = function(id) {
    const reqs = DB.getRequests();
    const idx = reqs.findIndex(r => r.id === id);
    reqs[idx].status = 'processed';
    DB.setRequests(reqs);
    renderRequests();
    renderDashboard();
  };

  window.deleteRequest = function(id) {
    if (!confirm('Удалить заявку?')) return;
    DB.setRequests(DB.getRequests().filter(r => r.id !== id));
    renderRequests();
    renderDashboard();
  };

  document.querySelectorAll('#admin-requests .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#admin-requests .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      requestFilter = btn.dataset.status;
      renderRequests();
    });
  });

  function renderClients(filter = '') {
    const tbody = document.getElementById('clientsTableBody');
    let users = DB.getUsers();
    if (filter) {
      const f = filter.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(f) || u.email.toLowerCase().includes(f));
    }
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-secondary);">Нет клиентов</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(u => {
      const userOrders = DB.getOrders().filter(o => o.userId === u.id || o.client === u.name).length;
      return `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${u.email}</td>
          <td>${u.phone || '—'}</td>
          <td>${userOrders}</td>
          <td>${u.registered || '—'}</td>
          <td class="actions">
            <button class="btn-delete" onclick="deleteClient(${u.id})">🗑️</button>
          </td>
        </tr>`;
    }).join('');
  }

  window.deleteClient = function(id) {
    if (!confirm('Удалить клиента?')) return;
    DB.setUsers(DB.getUsers().filter(u => u.id !== id));
    renderClients();
    renderDashboard();
  };

  document.getElementById('clientSearch')?.addEventListener('input', (e) => {
    renderClients(e.target.value);
  });

  function renderSection(section) {
    if (section === 'dashboard') renderDashboard();
    if (section === 'orders') renderOrders();
    if (section === 'products') renderProducts();
    if (section === 'requests') renderRequests();
    if (section === 'clients') renderClients();
  }

  renderDashboard();
})();
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target === m) m.classList.remove('active');
  });
});

function adminLogout() {
  if (confirm('Выйти из админ-панели?')) {
    localStorage.removeItem('atx_current_admin');
    window.location.href = 'admin-login.html';
  }
}

function formatPrice(p) { return new Intl.NumberFormat('ru-RU').format(p) + ' ₽'; }
function statusLabel(s) {
  return { new: 'Новый', processing: 'В работе', done: 'Выполнен', cancelled: 'Отменён' }[s] || s;
}

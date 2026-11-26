const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

// === LOGIKA HALAMAN AUTH (auth.html) ===
const authForm = document.getElementById('auth-form');
if (authForm) {
  const params = new URLSearchParams(window.location.search);
  let isRegister = params.get('mode') === 'register';

  const titleEl = document.getElementById('auth-title');
  const subtitleEl = document.getElementById('auth-subtitle');
  const nameGroup = document.getElementById('name-group');
  const submitBtn = document.getElementById('auth-submit');
  const switchText = document.getElementById('switch-text');
  const switchBtn = document.getElementById('switch-btn');

  const renderAuthMode = () => {
    titleEl.textContent = isRegister ? 'Buat Akun Baru' : 'Masuk ke Akun';
    subtitleEl.textContent = isRegister ? 'Mulai catat keuanganmu hari ini.' : 'Lanjutkan mengelola keuanganmu.';
    nameGroup.style.display = isRegister ? 'block' : 'none';
    submitBtn.textContent = isRegister ? 'Daftar & Masuk' : 'Masuk';
    switchText.textContent = isRegister ? 'Sudah punya akun?' : 'Belum punya akun?';
    switchBtn.textContent = isRegister ? 'Masuk di sini' : 'Daftar di sini';
  };

  renderAuthMode();

  switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isRegister = !isRegister;
    renderAuthMode();
  });

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const nameInput = document.getElementById('name').value.trim();
    const userName = nameInput || email.split('@')[0];

    localStorage.setItem('dompetku_user', JSON.stringify({ name: userName, email }));
    window.location.href = 'dashboard.html';
  });
}

// === LOGIKA HALAMAN DASHBOARD (dashboard.html) ===
const txForm = document.getElementById('transaction-form');
if (txForm) {
  const user = JSON.parse(localStorage.getItem('dompetku_user'));
  if (!user) {
    window.location.href = 'auth.html?mode=login';
  } else {
    document.getElementById('user-greeting').textContent = `Halo, ${user.name}`;
  }

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('dompetku_user');
    window.location.href = 'index.html';
  });

  let transactions = JSON.parse(localStorage.getItem('dompetku_tx')) || [];

  const renderDashboard = () => {
    const listEl = document.getElementById('transaction-list');
    listEl.innerHTML = '';

    let income = 0;
    let expense = 0;

    transactions.forEach((tx, index) => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;

      const li = document.createElement('li');
      li.className = 'tx-item';
      li.innerHTML = `
        <span>${tx.desc}</span>
        <div>
          <span class="tx-amount ${tx.type}">
            ${tx.type === 'income' ? '+' : '-'} ${formatRupiah(tx.amount)}
          </span>
          <button class="delete-btn" onclick="deleteTx(${index})" title="Hapus">✕</button>
        </div>
      `;
      listEl.appendChild(li);
    });

    if (transactions.length === 0) {
      listEl.innerHTML = '<li class="text-muted">Belum ada transaksi tercatat.</li>';
    }

    document.getElementById('total-balance').textContent = formatRupiah(income - expense);
    document.getElementById('total-income').textContent = formatRupiah(income);
    document.getElementById('total-expense').textContent = formatRupiah(expense);
  };

  window.deleteTx = (index) => {
    transactions.splice(index, 1);
    localStorage.setItem('dompetku_tx', JSON.stringify(transactions));
    renderDashboard();
  };

  txForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('tx-desc').value.trim();
    const amount = Number(document.getElementById('tx-amount').value);
    const type = document.getElementById('tx-type').value;

    transactions.unshift({ desc, amount, type });
    localStorage.setItem('dompetku_tx', JSON.stringify(transactions));
    txForm.reset();
    renderDashboard();
  });

  renderDashboard();
}

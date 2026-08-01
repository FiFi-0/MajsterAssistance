const statusEl = document.getElementById('status');

fetch('/api/health')
  .then((res) => res.json())
  .then((data) => {
    statusEl.textContent = `Serwer działa (status: ${data.status})`;
  })
  .catch(() => {
    statusEl.textContent = 'Brak połączenia z serwerem.';
  });

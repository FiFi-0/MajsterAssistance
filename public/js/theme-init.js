const theme = localStorage.getItem('majster_theme') || 'dark';
document.documentElement.classList.toggle('dark', theme === 'dark');

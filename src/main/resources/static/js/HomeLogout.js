function getLogout() {
    const client = 'http://localhost:8000';
    window.localStorage.removeItem('userId');
    window.location.href = `${client}/login`;
}

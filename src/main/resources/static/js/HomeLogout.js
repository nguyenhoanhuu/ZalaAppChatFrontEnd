function getLogout() {
    const client = 'https://zalachat.herokuapp.com';
    window.localStorage.removeItem('userId');
    window.location.href = `${client}/login`;
}


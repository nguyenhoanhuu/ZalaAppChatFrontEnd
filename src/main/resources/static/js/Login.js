const api = 'https://zalachatapp.herokuapp.com';
const client = 'https://zalachat.herokuapp.com';


$(document).ready(function () {
    let form = document.getElementById('formLogin');
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        let phoneNumber = form.elements['phoneNumber'].value;
        let password = form.elements['password'].value;

        let loginData = {
            phoneNumber: phoneNumber,
            password: password,
        };

        $.ajax({
            url: `${api}/auth/login`,
            type: 'POST',
            data: JSON.stringify(loginData),
            async: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader('Content-Type', 'application/json');
            },
            success: function (result) {
                if (result.userId) {
                    localStorage.setItem('userId', result.userId);
                    window.location.href = `${client}/home`;
                } else {
                    alert('Tài khoản mật khẩu không đúng');
                }
            },
            error: function (textStatus, errorThrown) {
                console.log('Error: ' + textStatus + errorThrown);
            },
        });
    });
});

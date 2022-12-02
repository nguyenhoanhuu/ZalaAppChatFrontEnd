const api = 'https://zalachatapp.herokuapp.com';
const client = 'https://zalachat.herokuapp.com';

let formRegis;
let checkCaptcha = false;
let account;

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyB0FKXbSt_rK7wRNtlz0opywxtoGYFmtLg",
    authDomain: "zala-d8638.firebaseapp.com",
    projectId: "zala-d8638",
    storageBucket: "zala-d8638.appspot.com",
    messagingSenderId: "535358142860",
    appId: "1:535358142860:web:546bc106e7a66b68b3fea9",
    measurementId: "G-V6JFR21WZC"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();

window.recaptchaVerifier = new RecaptchaVerifier(
    'recaptcha-container',
    {
        size: 'normal',
        callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // ...
            checkCaptcha = true;
            $('#btnSendOTP').removeAttr('disabled');
        },
        'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            // ...
            checkCaptcha = false;
            $('#btnSendOTP').attr('disabled');
        },
    },
    auth
);

recaptchaVerifier.render().then((widgetId) => {
    window.recaptchaWidgetId = widgetId;
});

// const phoneNumber = "+84345826324";
const appVerifier = window.recaptchaVerifier;

$(document).ready(function () {
    let form = document.getElementById('formVerifyPhoneBumber');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });
});

$('#btnSendOTP').click(() => {
    let phoneNumber = $('#phoneNumber').val();

    $.ajax({
        url: `${api}/account/filter?phoneNumber=${phoneNumber.slice(-11)}`,
        type: 'GET',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function (result) {
            account = result;
            if (result) {
                signInWithPhoneNumber(auth, phoneNumber, appVerifier)
                    .then((confirmationResult) => {
                        // SMS sent. Prompt user to type the code from the message, then sign the
                        // user in with confirmationResult.confirm(code).
                        window.confirmationResult = confirmationResult;
                        // alert("da gui tin nhan");
                        // ...
                    })
                    .catch((error) => {
                        grecaptcha.reset(window.recaptchaWidgetId);

                        // Or, if you haven't stored the widget ID:
                        window.recaptchaVerifier.render().then(function (widgetId) {
                            grecaptcha.reset(widgetId);
                        });
                        console.log(error.message);
                    });
            } else {
                alert('SDT này chưa được đăng ký');
            }
        },
        error: function (textStatus, errorThrown) {
            console.log('Error: ' + textStatus + errorThrown);
            return false;
        },
    });
});

$('#btnVerifyOTP').click(() => {
    const code = document.getElementById('otp').value;
    confirmationResult
        .confirm(code)
        .then((result) => {
            // User signed in successfully.
            // alert("da xac thuc code");
            // ...
        })
        .catch((error) => {
            // User couldn't sign in (bad verification code?)
            // ...
            alert('Mã không hợp lệ');
            console.log(error.message);
        });
});

$('#btnChangePassword').click(() => {
    let newPasssword = $('#password').val();

    const formUpdateAccount = {
        id: account.id,
        phoneNumber: account.phoneNumber,
        password: newPasssword,
        userId: account.userId,
    };

    $.ajax({
        type: 'PUT',
        url: `${api}/account`,
        data: JSON.stringify(formUpdateAccount),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function () {
            // alert("Cap nhat thanh cong");
            window.location.href = `${client}/login`;
        },
        async: true,
    });
});

const checkConfirmPassword = () => {
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirmPassword').value;

    return password === confirmPassword ? true : false;
};

$('#confirmPassword').blur(() => {
    if (checkConfirmPassword()) {
        $('#errorPassword').css('display', 'none');
    } else {
        $('#errorPassword').css('display', 'block');
    }
});

const api = "http://localhost:8080";
const client = "http://localhost:8000";

let formRegis;
let checkCaptcha = false;

// $(document).ready(function () {
//     let form = document.getElementById('formRegister');

//     form.addEventListener('submit', (event) => {
//         event.preventDefault();
//         let fullName = form.elements['fullName'].value;

//         let phoneNumber = form.elements['phoneNumber'].value;
//         let password = form.elements['password'].value;

//         let formRegis = {
//             phoneNumber: phoneNumber,
//             password: password,
//             fullName: fullName,
//         };
//         $.ajax({
//             type: 'POST',
//             url: `${api}/auth/register`,
//             data: JSON.stringify(formRegis),
//             beforeSend: function (xhr) {
//                 xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
//                 xhr.setRequestHeader("Accept", "application/json");
//                 xhr.setRequestHeader("Content-Type", "application/json");
//             },
//             success: function () {
//                 window.location.href = `${client}/login`;
//             },
//             async: true,
//         });
//     });
// });

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

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
    "recaptcha-container",
    {
        size: "normal",
        callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // ...
            checkCaptcha = true;
            $("#btnRegister").removeAttr("disabled");
        },
        "expired-callback": () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            // ...
            checkCaptcha = false;
            $("#btnRegister").attr("disabled");
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
    let form = document.getElementById("formRegister");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let fullName = form.elements["fullName"].value;

        let phoneNumber = form.elements["phoneNumber"].value;
        let password = form.elements["password"].value;

        $.ajax({
            url: `${api}/users/filter?phoneNumber=${phoneNumber.slice(-11)}`,
            type: "GET",
            async: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
            },
            success: function (result) {
                console.log(result);
                if (!result) {
                    formRegis = {
                        phoneNumber: phoneNumber,
                        password: password,
                        fullName: fullName,
                        avatar: "https://th.bing.com/th/id/OIP.cUUf67YH-hex_XPKWlnZ1QHaLF?pid=ImgDet&rs=1",
                    };

                    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
                        .then((confirmationResult) => {
                            // SMS sent. Prompt user to type the code from the message, then sign the
                            // user in with confirmationResult.confirm(code).
                            window.confirmationResult = confirmationResult;
                            console.log("da gui tin nhan");
                            // ...
                        })
                        .catch((error) => {
                            grecaptcha.reset(window.recaptchaWidgetId);

                            // Or, if you haven't stored the widget ID:
                            window.recaptchaVerifier
                                .render()
                                .then(function (widgetId) {
                                    grecaptcha.reset(widgetId);
                                });
                            console.log(error.message);
                        });
                } else {
                    alert("SDT này đã được đăng ký");
                }
            },
            error: function (textStatus, errorThrown) {
                console.log("Error: " + textStatus + errorThrown);
                return false;
            },
        });

        // formRegis = {
        //     phoneNumber: phoneNumber,
        //     password: password,
        //     fullName: fullName,
        // };

        // signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        //     .then((confirmationResult) => {
        //         // SMS sent. Prompt user to type the code from the message, then sign the
        //         // user in with confirmationResult.confirm(code).
        //         window.confirmationResult = confirmationResult;
        //         console.log("da gui tin nhan");
        //         // ...
        //     })
        //     .catch((error) => {
        //         grecaptcha.reset(window.recaptchaWidgetId);

        //         // Or, if you haven't stored the widget ID:
        //         window.recaptchaVerifier.render().then(function (widgetId) {
        //             grecaptcha.reset(widgetId);
        //         });
        //         console.log(error.message);
        //     });

        // $.ajax({
        //     type: "POST",
        //     url: `${api}/auth/register`,
        //     data: JSON.stringify(formRegis),
        //     beforeSend: function (xhr) {
        //         xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        //         xhr.setRequestHeader("Accept", "application/json");
        //         xhr.setRequestHeader("Content-Type", "application/json");
        //     },
        //     success: function () {
        //         window.location.href = `${client}/login`;
        //     },
        //     async: true,
        // });
    });
});

$("#btnVerifyPhoneNumber").click(() => {
    const code = document.getElementById("verificationcode").value;
    console.log(code);
    console.log(formRegis);
    confirmationResult
        .confirm(code)
        .then((result) => {
            // User signed in successfully.
            console.log("da xac thuc code");
            $.ajax({
                type: "POST",
                url: `${api}/auth/register`,
                data: JSON.stringify(formRegis),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                },
                success: function (result) {
                    alert("Dang ky thanh cong");
                    // window.location.href = `${client}/login`;
                    localStorage.setItem("userId", result.userId);
                    window.location.href = `${client}/home`;
                },
                async: true,
            });
            // ...
        })
        .catch((error) => {
            // User couldn't sign in (bad verification code?)
            // ...
            alert("đăng ký thành Mã không hợp lệ");
            console.log(error.message);
        });
});

$("#phoneNumber").blur(() => {
    let phoneNumber = document.getElementById("phoneNumber").value;

    $.ajax({
        url: `${api}/users/filter?phoneNumber=${phoneNumber.slice(-11)}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
            console.log(result);
            if (result) {
                $("#errorPhoneNumber").css("display", "block");
            } else {
                $("#errorPhoneNumber").css("display", "none");
            }
        },
        error: function (textStatus, errorThrown) {
            console.log("Error: " + textStatus + errorThrown);
            return false;
        },
    });
});

const checkConfirmPassword = () => {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    return password === confirmPassword ? true : false;
};

$("#confirmPassword").blur(() => {
    if (checkConfirmPassword()) {
        $("#errorPassword").css("display", "none");
    } else {
        $("#errorPassword").css("display", "block");
    }
});

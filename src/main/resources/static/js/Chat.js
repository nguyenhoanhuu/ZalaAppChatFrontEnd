// const api = "http://localhost:8080";
// const client = "http://localhost:8000";
let filesArr = new Array();
$(document).ready(function () {
    $('#inputImg').on('change', (input) => {
        ClearElementChild('listImageSelectTemporary');

        const files = input.target.files;
        for (var i = 0, l = files.length; i < l; i++) {
            filesArr.push(files[i]);
        }
        renderListImageTemporaryInScreen(filesArr);
    });
});
function handleRemoveFileInFileListTemporary(index) {
    filesArr.splice(index, 1);
    ClearElementChild('listImageSelectTemporary');

    renderListImageTemporaryInScreen(filesArr);
}
function ClearElementChild(id) {
    const elementListImgTemporary = document.getElementById(id);
    while (elementListImgTemporary.hasChildNodes()) {
        elementListImgTemporary.removeChild(elementListImgTemporary.firstChild);
    }
}

function renderListImageTemporaryInScreen(arrayList) {
    let viewImgTemporary = '';
    for (let index = 0; index < arrayList.length; index++) {
        viewImgTemporary += `
            <div class="position-relative">
                <img class=" avatar-lg img-thumbnail"
                style="border-radius: 30px;"
                    src="${handleSelectImage(arrayList[index])}"
                    alt="" srcset=""/>

                <i class="fas fa-times-circle img-thumbnail position-absolute" id="btn-delete-imgTemporaryItem" width="20px"
                    height="20px" style=" top:0px ; right: 0px; cursor: pointer; " onClick="handleRemoveFileInFileListTemporary(${index})"></i>
            </div>
    `;
    }
    $('#listImageSelectTemporary').append(viewImgTemporary);
}
// lấy file hình ảnh đã chọn và render tạm thời lên giao diện
function handleSelectImage(file) {
    const urlRenderTemporary = URL.createObjectURL(file);
    return urlRenderTemporary;
}

function appendEmoji(emoji) {
    $('#message-to-send').val($('#message-to-send').val() + `${emoji}`);
}
$('#oldpassword_changePassword_modal').blur(() => {
    // console.log(user);
    let oldPassword = document.getElementById('oldpassword_changePassword_modal').value;
    let bool = false;
    $.ajax({
        url: `${api}/account/filter?phoneNumber=${user.phoneNumber.slice(-11)}`,
        type: 'GET',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function (result) {
            mainAccount = result;

            const bodyCheckPassword = {
                passwordSHA256: result.password,
                password: oldPassword,
            };

            $.ajax({
                url: `${api}/account/checkPassword?passwordSHA256=${result.password}&password=${oldPassword}`,
                type: 'POST',
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                    xhr.setRequestHeader('Accept', 'application/json');
                    xhr.setRequestHeader('Content-Type', 'application/json');
                },
                success: function (res) {
                    if (res) {
                        bool = true;
                    }
                    if (bool) {
                        $('#errorPassword').css('display', 'none');
                    } else {
                        $('#errorPassword').css('display', 'block');
                    }
                },
                error: function (textStatus, errorThrown) {
                    console.log('Error: ' + textStatus + errorThrown);
                    return false;
                },
            });
        },
        error: function (textStatus, errorThrown) {
            console.log('Error: ' + textStatus + errorThrown);
            return false;
        },
    });
});
$('#btnChangePassword').click(() => {
    let newPasssword = $('#password').val();

    mainAccount.password = newPasssword;

    $.ajax({
        type: 'PUT',
        url: `${api}/account`,
        data: JSON.stringify(mainAccount),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function () {
            $('#change-password-modal').modal('hide');
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
        $('#errorPasswordConfirm').css('display', 'none');
    } else {
        $('#errorPasswordConfirm').css('display', 'block');
    }
});

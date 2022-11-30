$(document).ready(function () {});

let friendFinded;

const handleFindUserByPhoneNumber = () => {
    const phoneNumber = $("#inputFindUserByPhoneNumber").val();

    $.ajax({
        url: `${api}/users/filter?phoneNumber=${phoneNumber}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
            friendFinded = result;

            if (friendFinded) {
                let html = `
                    <div id="group_card" class="card group_card_mb">
                        <div class="card-body">
                        <div class="d-flex">
                            <div class="avatar avatar-online mr-5">
                                <div class="chat-user-img align-self-center me-3 ms-0">
                                    <div class="avatar-xs">
                                        <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                            U
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-1 overflow-hidden">
                                <h6 class="mb-0">${friendFinded.fullName}</h6>
    
                            </div>
                            <div class="align-self-auto ml-auto">
                                <div class="custom-control custom-checkbox">
                                    <input type="hidden" value=" data.id + '" id="RecipientId">
                                    <label class="custom-control-label" for="inputContactId"></label>
                                </div>
                            </div>
                        </div>
                        </div>
                        <label class="stretched-label" for="id-user-1"></label>
                    </div>
                `;

                if (
                    contacts.find((item) => item.friendId === friendFinded.id)
                ) {
                    html =
                        html +
                        `
                     <h6>Người dùng này đã là bạn bè</h6>
                    `;
                }

                document.getElementById("findUserByPhoneNumber").innerHTML =
                    html;
                // $("#btnSendRequestAddFriend").removeAttr("disabled");
                // $("#btnSendRequestAddFriend").prop("disabled", false);
            } else {
                $("#findUserByPhoneNumber").html(() => {
                    return "<h6>Không tìm thấy người dùng này</h6>";
                    // $("#btnSendRequestAddFriend").prop("disabled", true);
                });
                // alert("Không tìm thấy người dùng này");
            }
        },
        error: function (textStatus, errorThrown) {
            console.log("Error: " + textStatus + errorThrown);
        },
    });
};

const handleAcceptAddFriend = (friendId, nameFriend, requestId) => {
    const bodyRequestAddFriend = {
        userId: user.id,
        nameUser: user.fullName,
        friendId: friendId,
        nameFriend: nameFriend,
        requestId: requestId,
    };

    console.log(bodyRequestAddFriend);

    $.ajax({
        url: `${api}/contacts`,
        type: "POST",
        data: JSON.stringify(bodyRequestAddFriend),
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
            $(`#addFriendRequest_${requestId}`).remove();

            //add conversation

            $.ajax({
                url: `${api}/conversations/${result.conversationId}`,
                type: "GET",
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                },
                success: function (result) {
                    connectToChat(result);

                    let converSationNameSolo;

                    if (result.groupName.includes("-")) {
                        let temp = result.groupName.split("-");
                        temp.forEach((name) => {
                            if (name !== user.fullName) {
                                converSationNameSolo = name;
                            }
                        });
                    }

                    const htmlConversation = `
                            <li onClick="handleSelectConversation('${
                                result.id
                            }')">
                                <a href="#">
                                    <div id="conversationID_${
                                        result.id
                                    }" class="d-flex">
                                        <div class="chat-user-img align-self-center me-3 ms-0">
                                            <div class="avatar-xs">
                                                <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                                        ${"U"}
                                                    </span>
                                            </div>
                                        </div>
                                        <div id="conversation_messageNotify_${
                                            result.id
                                        }" class="flex-1 overflow-hidden">
                                            <h5 class="text-truncate font-size-15 mb-1">${
                                                !converSationNameSolo
                                                    ? result.groupName
                                                    : converSationNameSolo
                                            }</h5>
                                        </div>
                                    </div>
                                </a>
                            </li>`;
                    $("#listConversation").append(htmlConversation);
                    conversations.push(result);
                    console.log(conversations);
                },
                error: function (textStatus, errorThrown) {
                    console.log("Error: " + textStatus + errorThrown);
                },
            });
        },
    });
};
const handleDeleteAddFriend = (notifycationId) => {
    console.log(notifycationId);
    // http://localhost:8080/notifycation/deleteFriendRequest/MfLLwnbKYVzziTG8Fxy3
    $.ajax({
        url: `${api}/notifycation/deleteFriendRequest/${notifycationId}`,
        type: "DELETE",
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
            $("#123").remove();
            alert("thanhcong");
            // window.location.reload();
        },
    });
};
const handleRequestAddFriend = () => {
    const phoneNumber = $("#inputFindUserByPhoneNumber").val();
    if (phoneNumber && phoneNumber !== "") {
        const bodyAddFriend = {
            userId: user.id,
            nameUser: user.fullName,
            friendId: friendFinded.id,
            nameFriend: friendFinded.fullName,
        };

        alert("Đã gửi lời mời kết bạn");

        stompClientNotifycation.send(
            "/app/notifycation/" + friendFinded.id,
            {},
            JSON.stringify(bodyAddFriend)
        );
    }
};

const handleCreateGroup = () => {
    const groupName = $("#addGroupnameInput").val();
    let memberSelectedCreateGroup = [user.id];

    $("input:checkbox[name=contacts]:checked").each(function () {
        memberSelectedCreateGroup.push($(this).val());
    });

    const bodyCreateGroup = {
        groupName: groupName,
        memberInGroup: memberSelectedCreateGroup,
        admin: user.id,
    };

    $.ajax({
        url: `${api}/conversations`,
        type: "POST",
        data: JSON.stringify(bodyCreateGroup),
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
            //add conversation

            alert("Tạo nhóm thành công");
            // window.location.reload();
            $.ajax({
                url: `${api}/conversations/${result.id}`,
                type: "GET",
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                },
                success: function (result) {
                    connectToChat(result);

                    const htmlConversation = `
                            <li onClick="handleSelectConversation('${
                                result.id
                            }')">
                                <a href="#">
                                    <div id="conversationID_${
                                        result.id
                                    }" class="d-flex">
                                        <div class="chat-user-img align-self-center me-3 ms-0">
                                            <div class="avatar-xs">
                                                <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                                        ${"U"}
                                                    </span>
                                            </div>
                                        </div>
                                        <div id="conversation_messageNotify_${
                                            result.id
                                        }" class="flex-1 overflow-hidden">
                                            <h5 class="text-truncate font-size-15 mb-1">${
                                                result.groupName
                                            }</h5>
                                        </div>
                                    </div>
                                </a>
                            </li>`;
                    $("#listConversation").append(htmlConversation);
                    conversations.push(result);
                    console.log(conversations);
                },
                error: function (textStatus, errorThrown) {
                    console.log("Error: " + textStatus + errorThrown);
                },
            });
        },
    });
};

let stompClientNotifycation;

$(document).ready(function () {
    (async () => {
        let socket = new SockJS(api + '/notifycation');
        stompClientNotifycation = Stomp.over(socket);
        await stompClientNotifycation.connect({}, function (frame) {
            console.log('connected to notifycation user: ' + frame);
            stompClientNotifycation.subscribe(
                '/topic/notifycation/' + localStorage.getItem('userId'),
                function (response) {
                    let request = JSON.parse(response.body);

                    let htmlAddFriendRequest = `
                    <li id="addFriendRequest_${request.id}" href="#" class="list-group-item text-left d-flex">
                        <div class="chat-user-img align-self-center me-3 ms-0">
                            <div class="avatar-xs">
                                <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                    U
                                </span>
                            </div>
                        </div>
                        <label class="name">
                            ${request.nameFriend}<br>
                            <div style="text-align: center">
                                <a onClick="handleAcceptAddFriend('${request.friendId}', '${request.nameFriend}', '${request.id}')" class="btn btn-success" href="#" title="Accept"><i class="fas fa-check"></i> Chấp nhận</a>
                                <a onClick="handleDeleteAddFriend('${request.id}')" class="btn btn-danger" href="#" title="Cancel"><i class="fas fa-times" ></i> Từ chối</a>
                            </div>
                        </label>
                    </li>
                    `;

                    $('#listAddFriendRequest').append(htmlAddFriendRequest);
                }
            );
        });
    })();

    $.ajax({
        url: `${api}/notifycation/addFriendRequest/${localStorage.getItem('userId')}`,
        type: 'GET',
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function (result) {
            let htmlAddFriendRequest = '';
            result.map((request) => {
                htmlAddFriendRequest =
                    htmlAddFriendRequest +
                    `
                <li id="addFriendRequest_${request.id}" href="#" class="list-group-item text-left d-flex">
                    <div class="chat-user-img align-self-center me-3 ms-0">
                        <div class="avatar-xs">
                            <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                U
                            </span>
                        </div>
                    </div>
                    <label class="name">
                        ${request.nameFriend}<br>
                        <div style="text-align: center">
                            <a onClick="handleAcceptAddFriend('${request.friendId}', '${request.nameFriend}', '${request.id}')" class="btn btn-success" href="#" title="Accept"><i class="fas fa-check"></i> Chấp nhận</a>
                            <a onClick="handleDeleteAddFriend('${request.id}')" class="btn btn-danger" href="#" title="Cancel"><i class="fas fa-times"></i> Từ chối</a>
                        </div>
                    </label>
                </li>
                `;
            });

            $('#listAddFriendRequest').append(htmlAddFriendRequest);
        },
        error: function (textStatus, errorThrown) {
            console.log('Error: ' + textStatus + errorThrown);
        },
    });
});

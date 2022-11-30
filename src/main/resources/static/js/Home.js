const api = "http://localhost:8080";
const client = "http://localhost:8000";

let user;
let listGroupChat = [];
let contacts;
let conversations;
let conversationSelected;
let myMemberInConversationSelected;
let membersInGroup = [];
let avatarInConversationSelected;
let urlListImage = "";
//socket
let stompClient;

if (!localStorage.getItem("userId")) {
  window.location.href = `${client}/login`;
}

$(document).ready(function () {
  (async () => {
    if (localStorage.getItem("userId")) {
      await $.ajax({
        url: `${api}/users/${localStorage.getItem("userId")}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
          user = result;
          console.log(user);
          $("#userInfo-fullName").html(() => {
            return "";
          });
          $("#userInfo-about-fullName").html(() => {
            return "";
          });
          $("#userInfo-about-phoneNumber").html(() => {
            return "";
          });
          $(".userAvatar").prop("src", user.avatar);
          $("#userInfo-fullName").append(user.fullName);
          $("#userName").append(user.fullName);
          $("#userInfo-about-fullName").append(user.fullName);
          $("#userInfo-about-phoneNumber").append(user.phoneNumber);
          $("#userInfo-update-fullName").append(user.fullName);
          $("#userInfo-update-about-fullName").val(user.fullName);
          $("#userInfo-update-about-phoneNumber").val(user.phoneNumber);
        },

        error: function (textStatus, errorThrown) {
          console.log("Error: " + textStatus + errorThrown);
        },
      });
    }

    if (localStorage.getItem("userId")) {
      await $.ajax({
        url: `${api}/contacts/user/${localStorage.getItem("userId")}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
          contacts = result;
          let htmlContacts = "";
          let htmlContactsChat = "";
          let htmlContactsCreateGroup = "";

          contacts.map((contact) => {
            htmlContacts =
              htmlContacts +
              `
                            <li onClick="handleSelectConversation('${contact.conversationId}')">
                                <div class="d-flex align-items-center">
                                    <div class="flex-1">
                                        <h5 class="font-size-14 m-0">${contact.nameFriend}</h5>
                                    </div>
                                    <div class="dropdown">
                                        <a href="#" class="text-muted dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <i class="ri-more-2-fill"></i>
                                            </a>
                                        <div class="dropdown-menu dropdown-menu-end">
                                            <a class="dropdown-item" href="#">Share <i class="ri-share-line float-end text-muted"></i></a>
                                            <a class="dropdown-item" href="#">Block <i class="ri-forbid-line float-end text-muted"></i></a>
                                            <a class="dropdown-item" href="#">Remove <i class="ri-delete-bin-line float-end text-muted"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </li>`;

            htmlContactsCreateGroup =
              htmlContactsCreateGroup +
              `
                        <li>
                            <div class="form-check">
                                <input type="checkbox" name="contacts" value="${contact.friendId}" class="form-check-input" id="contact_${contact.friendId}">
                                <label class="form-check-label" for="memberCheck1">${contact.nameFriend}</label>
                            </div>
                        </li>
                        `;

            // htmlContactsChat =
            //     htmlContactsChat +
            //     `<div class="item">
            //     <a href="#" class="user-status-box">
            //         <div class="avatar-xs mx-auto d-block chat-user-img online">
            //             <img src="assets/images/users/avatar-5.jpg" alt="user-img" class="img-fluid rounded-circle">
            //             <span class="user-status"></span>
            //         </div>

            //         <h5 class="font-size-13 text-truncate mt-3 mb-1">Emily</h5>
            //     </a>
            // </div>`;
          });

          $("#listContact").append(htmlContacts);
          $("#contactsCreateGroup").append(htmlContactsCreateGroup);
          // $("#contactsCreateGroup123").append(htmlContactsCreateGroup);
          // $("#user-status-carousel").append(htmlContactsChat);
        },
        error: function (textStatus, errorThrown) {
          console.log("Error: " + textStatus + errorThrown);
        },
      });

      await $.ajax({
        url: `${api}/conversations/user/${localStorage.getItem("userId")}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
          // conversations = result;
          // const conversationsData = result;

          // let membersData = [];
          // let messageData = [];

          let html = "";

          const conversationData = result.map((conversation) => {
            // let constversationData = {
            //     ...conversation,
            // };

            if (
              !contacts.find(
                (contact) => contact.conversationId === conversation.id
              )
            ) {
              listGroupChat.push(conversation);
              const htmlListGroupChat = `
                                <li id="groupChat_${conversation.id}">
                                    <a href="#">
                                        <div class="d-flex align-items-center">
                                            <div class="chat-user-img me-3 ms-0">
                                                <div class="avatar-xs">
                                                    <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                                            G
                                                        </span>
                                                </div>
                                            </div>
                                            <div class="flex-1 overflow-hidden">
                                                <h5 class="text-truncate font-size-14 mb-0">${conversation.groupName}</h5>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                                `;
              $("#listChatGroup").append(htmlListGroupChat);
            }

            connectToChat(conversation);

            let converSationNameSolo;

            if (conversation.groupName.includes("-")) {
              let temp = conversation.groupName.split("-");
              temp.forEach((name) => {
                if (name !== user.fullName) {
                  converSationNameSolo = name;
                }
              });
            }

            html =
              html +
              `
                            <li onClick="handleSelectConversation('${
                              conversation.id
                            }')">
                                <a href="#">
                                    <div id="conversationID_${
                                      conversation.id
                                    }" class="d-flex">
                                        <div class="chat-user-img align-self-center 
                                        ">
                                            <div class="avatar-xs">
                                                <span class="avatar-title rounded-circle bg-soft-primary text-primary">
                                                        ${"U"}
                                                    </span>
                                            </div>
                                        </div>
                                        <div id="conversation_messageNotify_${
                                          conversation.id
                                        }" class="flex-1 overflow-hidden">
                                            <h5 class="text-truncate font-size-15 mb-1">${
                                              !converSationNameSolo
                                                ? conversation.groupName
                                                : converSationNameSolo
                                            }</h5>
                                        </div>
                                    </div>
                                </a>
                            </li>`;

            // html =
            //     html +
            //     `
            //     <li>
            //                 <a href="#">
            //                     <div class="d-flex">
            //                         <div class="chat-user-img online align-self-center me-3 ms-0">
            //                             <img src="assets/images/users/avatar-2.jpg" class="rounded-circle avatar-xs" alt="">
            //                             <span class="user-status"></span>
            //                         </div>

            //                         <div class="flex-1 overflow-hidden">
            //                             <h5 class="text-truncate font-size-15 mb-1">Patrick Hendricks</h5>
            //                             <p class="chat-user-message text-truncate mb-0">Hey! there I'm available</p>
            //                         </div>
            //                         <div class="font-size-11">05 min</div>
            //                     </div>
            //                 </a>
            //             </li>`;

            // =========================
            $.ajax({
              url: `${api}/conversations/chat/${conversation.id}`,
              type: "GET",
              async: true,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
              },
              success: function (result) {
                // const messages = result;

                const messagesHistory = result.sort(function (a, b) {
                  return new Date(a.createAt) - new Date(b.createAt);
                });

                messageData = [...messagesHistory];

                if (messagesHistory.length > 0) {
                  const lastMessageInConversation =
                    messagesHistory[messagesHistory.length - 1];
                  let notifyLastMessageHistory = "";
                  if (lastMessageInConversation.type === "text") {
                    notifyLastMessageHistory =
                      lastMessageInConversation.content;
                  } else {
                    notifyLastMessageHistory = "đã gửi cho bạn 1 file ";
                  }
                  let htmlMessageNotify = `
                                    <p  id="notifyMessage_${lastMessageInConversation.conversationId}" class="chat-user-message mb-0" style="font-size:13px;overflow:hidden">${lastMessageInConversation.senderName}: ${notifyLastMessageHistory}</p>
                                `;
                  $(
                    `#conversation_messageNotify_${lastMessageInConversation.conversationId}`
                  ).append(htmlMessageNotify);
                }
              },
              error: function (textStatus, errorThrown) {
                console.log("Error: " + textStatus + errorThrown);
              },
            });

            // console.log(membersData);

            // conversation = {
            //     ...conversation,
            //     membersData: membersData,
            //     messageData: messageData,
            // };

            return conversation;
          });

          // console.log(conversationData);
          conversations = [...conversationData];

          $("#listConversation").append(html);
          handleSelectConversation(conversations[0].id);
          $("#userChat").removeClass("user-chat-show");
        },
        error: function (textStatus, errorThrown) {
          console.log("Error: " + textStatus + errorThrown);
        },
      });
    }
  })();
});

const handleSelectConversation = async (conversationId) => {
  $("#chatConversation").html(() => {
    return "";
  });
  $("#memberaddInGroup").html(() => {
    return "";
  });
  $("#conversationName").html(() => {
    return "";
  });
  $("#infoGroupName").html(() => {
    return "";
  });
  $("#membersInGroup").html(() => {
    return "";
  });
  $(`#notify_${conversationId}`).remove();
  $("#userChat").addClass("user-chat-show");
  $("#membersInGroupModalChangeAdmin").html(() => {
    return "";
  });

  // $(`#notifyMessage_${conversationId}`).remove();

  // conversationSelected = await conversations.find(
  //     (conversation) => (conversation.id = conversationId)
  // );

  // const conversation = conversationSelected;

  // let converSationNameSolo;

  // if (conversation.groupName.includes("-")) {
  //     let temp = conversation.groupName.split("-");
  //     temp.forEach((name) => {
  //         if (name !== user.fullName) {
  //             converSationNameSolo = name;
  //         }
  //     });
  // }

  // $("#conversationName").append(
  //     !converSationNameSolo ? conversation.groupName : converSationNameSolo
  // );

  // $("#infoGroupName").append(
  //     !converSationNameSolo ? conversation.groupName : converSationNameSolo
  // );

  // //== xử lý members

  // membersInGroup = conversation.membersData;

  // console.log(conversation);

  // // console.log(Object.getOwnPropertyNames(conversationSelected));
  // console.log(conversationSelected.memberInGroup);

  // myMemberInConversationSelected = membersInGroup.find(
  //     (member) => member.userId === user.id
  // );

  // let htmlMembersInGroup = "";

  // membersInGroup.map((member) => {
  //     htmlMembersInGroup =
  //         htmlMembersInGroup +
  //         `
  //                         <div>
  //                             <p class="text-muted mb-1"></p>
  //                             <h5 class="font-size-14">${member.nameUser}</h5>
  //                         </div>
  //                     `;
  // });

  // //xử lý mess

  // const messages = conversation.membersData;
  // let htmlMessageInGroup = "";

  // const messagesHistory = messages.sort(function (a, b) {
  //     return new Date(a.createAt) - new Date(b.createAt);
  // });

  // messagesHistory.map((message) => {
  //     if (message.sender === myMemberInConversationSelected.id) {
  //         htmlMessageInGroup =
  //             htmlMessageInGroup +
  //             `
  //                                     <div class="message me mb-4 flex text-right">
  //                                         <div class="flex-1 px-2">
  //                                             <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
  //                                                 <span>${
  //                                                     message.content
  //                                                 }</span>
  //                                             </div>
  //                                             <div class="pr-4"><small class="text-gray-500">${formatDate(
  //                                                 message.createAt
  //                                             )}</small></div>
  //                                         </div>
  //                                     </div>
  //                                 `;
  //     } else {
  //         htmlMessageInGroup =
  //             htmlMessageInGroup +
  //             `
  //                                     <div class="message mb-4 flex">
  //                                         <div class="flex-2">
  //                                             <div class="w-12 h-12 relative">
  //                                                 <img class="w-12 h-12 rounded-full mx-auto" src="assets/images/users/avatar-4.jpg" alt="chat-user" />
  //                                                 <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
  //                                             </div>
  //                                         </div>
  //                                         <div class="flex-1 px-2">
  //                                             <div>
  //                                                 <p>${message.senderName}</p>
  //                                             </div>
  //                                             <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
  //                                                 <span>${
  //                                                     message.content
  //                                                 }</span>
  //                                             </div>
  //                                             <div class="pl-4"><small class="text-gray-500">${formatDate(
  //                                                 message.createAt
  //                                             )}</small></div>
  //                                         </div>
  //                                     </div>
  //                                 `;
  //     }
  // });

  // $("#chatConversation").append(htmlMessageInGroup);
  // scrollToBottomMessages();

  //==================================

  await $.ajax({
    url: `${api}/conversations/${conversationId}`,
    type: "GET",
    async: true,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
    },
    success: function (result) {
      conversationSelected = result;
      console.log(result);

      const conversation = result;

      let converSationNameSolo;

      const userId = localStorage.getItem("userId");
      const admin = conversationSelected.admin;

      checkAdmin = userId === admin ? true : false;

      checkAdmin
        ? $("#disbandingTheGroup").show()
        : $("#disbandingTheGroup").css("display", "none");

      checkAdmin
        ? $("#changeAdmin").show()
        : $("#changeAdmin").css("display", "none");

      conversationSelected.typeChat == false
        ? $("#addFriendGroup").css("display", "none")
        : $("#addFriendGroup").show();
      conversationSelected.typeChat == false
        ? $("#leaveConversation").css("display", "none")
        : $("#leaveConversation").show();

      if (conversation.groupName.includes("-")) {
        let temp = conversation.groupName.split("-");
        temp.forEach((name) => {
          if (name !== user.fullName) {
            converSationNameSolo = name;
          }
        });
        $("#avatarInConversation").prop("src", avatarInConversationSelected);
      } else {
        $("#avatarInConversation").prop(
          "src",
          "https://th.bing.com/th/id/OIP.cUUf67YH-hex_XPKWlnZ1QHaLF?pid=ImgDet&rs=1"
        );
      }

      $("#conversationName").append(
        !converSationNameSolo ? conversation.groupName : converSationNameSolo
      );

      $("#infoGroupName").append(
        !converSationNameSolo ? conversation.groupName : converSationNameSolo
      );

      //get members in group chat
      $.ajax({
        url: `${api}/conversations/members/${conversationId}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
          membersInGroup = result;

          myMemberInConversationSelected = membersInGroup.find(
            (member) => member.userId === user.id
          );
          membersInGroup.forEach((member) => {
            if (member.nameUser != user.fullName) {
              avatarInConversationSelected = member.avatar;
            }
          });
          let htmlMembersInGroup = "";
          let htmlMembersInGroupModalChangeAdmin = "";

          membersInGroup.map((member) => {
            htmlMembersInGroup =
              htmlMembersInGroup +
              `
                            <div>
                                <p class="text-muted mb-1"></p>
                                <h5 class="font-size-14">${member.nameUser}</h5>
                            </div>
                        `;
            if (member.userId !== user.id) {
              htmlMembersInGroupModalChangeAdmin =
                htmlMembersInGroupModalChangeAdmin +
                `
                                <li>
                                    <div class="form-check">
                                        <input type="radio" name="selectAdmin" value=${member.userId} class="form-check-input">
                                        <label class="form-check-label" for="memberCheck1">${member.nameUser}</label>
                                    </div>
                                </li>
                            `;
            }
            // console.log(htmlMembersInGroupModalChangeAdmin);
          });

          $("#membersInGroup").append(htmlMembersInGroup);
          $("#membersInGroupModalChangeAdmin").append(
            htmlMembersInGroupModalChangeAdmin
          );

          // console.log(myMemberInConversationSelected);

          //render chat

          $.ajax({
            url: `${api}/conversations/chat/${conversationId}`,
            type: "GET",
            async: true,
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
              xhr.setRequestHeader("Accept", "application/json");
              xhr.setRequestHeader("Content-Type", "application/json");
            },
            success: function (result) {
              const messages = result;
              let html = "";

              const messagesHistory = messages.sort(function (a, b) {
                return new Date(a.createAt) - new Date(b.createAt);
              });

              messagesHistory.map((message) => {
                let showContent = "";

                if (message.type === "text") {
                  if (message.sender === myMemberInConversationSelected.id) {
                    showContent += `
                    <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
                      <span>${message.content}</span>
                    </div>
                    <div class="pl-4"><small class="text-gray-500">${formatDate(
                      message.createAt
                    )}</small></div>
                    `;
                  } else {
                    showContent += `<div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
                                      <span>${message.content}</span>
                                    </div>
                                    <div class="pl-4"><small class="text-gray-500">${formatDate(
                                      message.createAt
                                    )}</small></div>`;
                  }
                } else if (message.type === "listImage") {
                  let flexDirection = "";
                  let alignItem = "";
                  if (message.sender === myMemberInConversationSelected.id) {
                    flexDirection = `flex-direction: row-reverse;`;
                    alignItem = "align-items: flex-end;";
                  }

                  const listImage = message.content.split("+");
                  console.log(listImage);
                  let listImageRender = "";

                  listImage.forEach((itemImage) => {
                    listImageRender += `<div>
                      <a class="popup-img d-inline-block m-1"
                          href="${itemImage}"
                          title="Project 1">
                          <img src="${itemImage}"
                              alt="" class="rounded border"
                              style="width:150px;height:100px">
                      </a>
                  </div>`;
                  });
                  showContent += `<div class="ctext-wrap-content">
                                      <ul class="list-inline message-img  mb-0 " style="
                                      display: flex;
                                      flex-direction: column;
                                      width: 100%;
                                      ${alignItem}
                                      ">
                                          <li class="list-inline-item message-img-list me-2 ms-0 "
                                              style="display: flex;flex-wrap: wrap;width:51%; ${flexDirection}">
                                                ${listImageRender}
                                          </li>

                                          <div class="message-img-link">
                                              <ul class="list-inline mb-0">
                                                  <li class="list-inline-item">
                                                      <a href="#">
                                                          <i class="ri-download-2-line"></i>
                                                      </a>
                                                  </li>
                                                  <li class="list-inline-item dropdown">
                                                      <a class="dropdown-toggle" href="#" role="button"
                                                          data-bs-toggle="dropdown" aria-haspopup="true"
                                                          aria-expanded="false">
                                                          <i class="ri-more-fill"></i>
                                                      </a>
                                                      <div class="dropdown-menu">
                                                          <a class="dropdown-item" href="#">Copy <i
                                                                  class="ri-file-copy-line float-end text-muted"></i></a>
                                                          <a class="dropdown-item" href="#">Save <i
                                                                  class="ri-save-line float-end text-muted"></i></a>
                                                          <a class="dropdown-item" href="#">Forward <i
                                                                  class="ri-chat-forward-line float-end text-muted"></i></a>
                                                          <a class="dropdown-item" href="#">Delete <i
                                                                  class="ri-delete-bin-line float-end text-muted"></i></a>
                                                      </div>
                                                  </li>
                                              </ul>
                                          </div>
                                          <div class="pr-4"><small class="text-gray-500">${formatDate(
                                            new Date().toString()
                                          )}</small></div>
                                      </ul>
                                  </div>`;
                } else if (message.type == "file") {
                  const inforFile = message.content.split("+");
                  showContent += `
                    <div class="inline-block p-2 px-6 " style ="background-color:#E4E6EB;color:black;border-radius: 7px;">
                    <a href=${
                      inforFile[2]
                    } style="display: flex;text-align: center;">
                                  <div style="border-radius:50%;background-color:rgba(0, 0, 0, 0.05);width:30px">
                                      <i class="fas fa-file-csv" style="position: relative;top: 7px;"> </i>
                                  </div> 
                                  <div style="padding-left:5px">
                                      <span style="display: block;">${
                                        inforFile[0]
                                      }</span>
                                      <span style="float: left;font-weight: 100;font-size: 11px;">
                                              ${inforFile[1]}
                                      </span>
                                  </div>
                              </div>
                              
                              </a>
                              <div class="pl-4"><small class="text-gray-500">${formatDate(
                                message.createAt
                              )}</small></div>
                          `;
                } else {
                  showContent += `<div class="ctext-wrap-content">
                  <ul class="list-inline message-img  mb-0">
                      <li class="list-inline-item message-img-list me-2 ms-0">
                          <div>
                              <a class="popup-img d-inline-block m-1" href="${
                                message.content
                              }" title="Project 1">
                                  <img src="${
                                    message.content
                                  }" alt="" class="rounded border" style=width:150px;height:100px>
                              </a>
                          </div>
                          <div class="message-img-link">
                              <ul class="list-inline mb-0">
                                  <li class="list-inline-item">
                                      <a href="#">
                                          <i class="ri-download-2-line"></i>
                                      </a>
                                  </li>
                                  <li class="list-inline-item dropdown">
                                      <a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                          <i class="ri-more-fill"></i>
                                      </a>
                                      <div class="dropdown-menu">
                                          <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                                          <a class="dropdown-item" href="#">Save <i class="ri-save-line float-end text-muted"></i></a>
                                          <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-end text-muted"></i></a>
                                          <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-end text-muted"></i></a>
                                      </div>
                                  </li>
                              </ul>
                          </div>
                      </li>
              
              
                  </ul>
              </div>
              <div class="pl-4"><small class="text-gray-500">${formatDate(
                message.createAt
              )}</small></div>`;
                }

                if (message.sender === myMemberInConversationSelected.id) {
                  html =
                    html +
                    `
                          <div class="message me mb-4 flex text-right">
                              <div class="flex-1 px-2">
                                      ${showContent}
                              </div>
                          </div>
                      `;
                } else {
                  html =
                    html +
                    `
                      <div class="message mb-4 flex">
                          <div class="flex-2">
                              <div class="w-12 h-12 relative">
                                  <img class="w-12 h-12 rounded-full mx-auto" src=${message.avatarSender} alt="chat-user" />
                                  <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
                              </div>
                          </div>
                          <div class="flex-1 px-2">
                              <div>
                                  <p>${message.senderName}</p>
                              </div>
                                ${showContent}
                              
                          </div>
                      </div>
                    `;
                }
              });

              $("#chatConversation").append(html);
              scrollToBottomMessages();
            },
            error: function (textStatus, errorThrown) {
              console.log("Error: " + textStatus + errorThrown);
            },
          });
        },
        error: function (textStatus, errorThrown) {
          console.log("Error: " + textStatus + errorThrown);
        },
      });
    },
    error: function (textStatus, errorThrown) {
      console.log("Error: " + textStatus + errorThrown);
    },
  });

  // $.ajax({
  //     url: `${api}/conversations/chat/${conversationId}`,
  //     type: "GET",
  //     async: true,
  //     beforeSend: function (xhr) {
  //         xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  //         xhr.setRequestHeader("Accept", "application/json");
  //         xhr.setRequestHeader("Content-Type", "application/json");
  //     },
  //     success: function (result) {
  //         const messages = result;
  //         let html = "";

  //         console.log(messages);

  //         messages.map((message) => {
  //             if (message.sender === myMemberInConversationSelected.id) {
  //                 html =
  //                     html +
  //                     `
  //                     <div class="message me mb-4 flex text-right">
  //                         <div class="flex-1 px-2">
  //                             <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
  //                                 <span>${message.content}</span>
  //                             </div>
  //                             <div class="pr-4"><small class="text-gray-500">${message.createAt}</small></div>
  //                         </div>
  //                     </div>
  //                 `;
  //             } else {
  //                 html =
  //                     html +
  //                     `
  //                     <div class="message mb-4 flex">
  //                         <div class="flex-2">
  //                             <div class="w-12 h-12 relative">
  //                                 <img class="w-12 h-12 rounded-full mx-auto" src="assets/images/users/avatar-4.jpg" alt="chat-user" />
  //                                 <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
  //                             </div>
  //                         </div>
  //                         <div class="flex-1 px-2">
  //                             <div>
  //                                 <p>${message.senderName}</p>
  //                             </div>
  //                             <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
  //                                 <span>${message.content}</span>
  //                             </div>
  //                             <div class="pl-4"><small class="text-gray-500">${message.createAt}</small></div>
  //                         </div>
  //                     </div>
  //                 `;
  //             }
  //         });

  //         $("#chatConversation").append(html);
  //     },
  //     error: function (textStatus, errorThrown) {
  //         console.log("Error: " + textStatus + errorThrown);
  //     },
  // });
};

const formatDate = (date) => {
  const d = new Date(date);

  const dformat =
    [d.getHours(), d.getMinutes()].join(":") +
    " " +
    [d.getDate(), d.getMonth() + 1, d.getFullYear()].join("/");
  return dformat;
};

const connectToChat = async (conversation) => {
  console.log("connecting to chat...");
  let socket = new SockJS(api + "/chat");
  stompClient = Stomp.over(socket);
  await stompClient.connect({}, function (frame) {
    console.log("connected to: " + frame);
    setTimeout(() => {
      stompClient.subscribe(
        "/topic/messages/" + conversation.id,
        function (response) {
          let message = JSON.parse(response.body);

          console.log(message);

          let showContent = "";

          if (message.type === "image") {
            showContent += `<div class="ctext-wrap-content">
            <ul class="list-inline message-img  mb-0">
                <li class="list-inline-item message-img-list me-2 ms-0">
                    <div>
                        <a class="popup-img d-inline-block m-1" href="${message.content}" title="Project 1">
                            <img src="${message.content}" alt="" class="rounded border" style=width:150px;height:100px>
                        </a>
                    </div>
                    <div class="message-img-link">
                        <ul class="list-inline mb-0">
                            <li class="list-inline-item">
                                <a href="#">
                                    <i class="ri-download-2-line"></i>
                                </a>
                            </li>
                            <li class="list-inline-item dropdown">
                                <a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="ri-more-fill"></i>
                                </a>
                                <div class="dropdown-menu">
                                    <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                                    <a class="dropdown-item" href="#">Save <i class="ri-save-line float-end text-muted"></i></a>
                                    <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-end text-muted"></i></a>
                                    <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-end text-muted"></i></a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>
        
        
            </ul>
        </div>`;
          } else if (message.type === "listImage") {
            let flexDirection = "";
            let alignItem = "";
            if (message.sender === myMemberInConversationSelected.id) {
              flexDirection = `flex-direction: row-reverse;`;
              alignItem = "align-items: flex-end;";
            }

            const listImage = message.content.split("+");
            console.log(listImage);
            let listImageRender = "";

            listImage.forEach((itemImage) => {
              listImageRender += `<div>
    <a class="popup-img d-inline-block m-1"
        href="${itemImage}"
        title="Project 1">
        <img src="${itemImage}"
            alt="" class="rounded border"
            style="width:150px;height:100px">
    </a>
</div>`;
            });
            showContent += `<div class="ctext-wrap-content">
                    <ul class="list-inline message-img  mb-0 " style="
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    ${alignItem}
                    ">
                        <li class="list-inline-item message-img-list me-2 ms-0 "
                            style="display: flex;flex-wrap: wrap;width:51%; ${flexDirection}">
                              ${listImageRender}
                        </li>

                        <div class="message-img-link">
                            <ul class="list-inline mb-0">
                                <li class="list-inline-item">
                                    <a href="#">
                                        <i class="ri-download-2-line"></i>
                                    </a>
                                </li>
                                <li class="list-inline-item dropdown">
                                    <a class="dropdown-toggle" href="#" role="button"
                                        data-bs-toggle="dropdown" aria-haspopup="true"
                                        aria-expanded="false">
                                        <i class="ri-more-fill"></i>
                                    </a>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#">Copy <i
class="ri-file-copy-line float-end text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Save <i
                                                class="ri-save-line float-end text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Forward <i
                                                class="ri-chat-forward-line float-end text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Delete <i
                                                class="ri-delete-bin-line float-end text-muted"></i></a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </ul>
                </div>`;
          } else if (message.type === "file") {
            const inforFile = message.content.split("+");
            showContent += `
                  <div class="inline-block p-2 px-6 " style ="background-color:#E4E6EB;color:black;border-radius: 7px;">
                  <a href=${inforFile[2]} style="display: flex;text-align: center;">
                                <div style="border-radius:50%;background-color:rgba(0, 0, 0, 0.05);width:30px">
                                    <i class="fas fa-file-csv" style="position: relative;top: 7px;"> </i>
                                </div> 
                                <div style="padding-left:5px">
                                    <span style="display: block;">${inforFile[0]}</span>
                                    <span style="float: left;font-weight: 100;font-size: 11px;">
                                            ${inforFile[1]}
                                    </span>
                                </div>
                            </div>
                            
                            </a>
                        `;
          } else {
            showContent += `
            <div class="inline-block bg-gray-300 rounded-full p-2 px-6 text-gray-700">
            <span>${message.content}</span>
            </div>
            `;
          }
          if (
            message.conversationId === conversationSelected.id &&
            message.sender !== myMemberInConversationSelected.id
          ) {
            let html = `
                            <div class="message mb-4 flex">
                                <div class="flex-2">
                                    <div class="w-12 h-12 relative">
                                        <img class="w-12 h-12 rounded-full mx-auto" src=${
                                          message.avatarSender
                                        } alt="chat-user" />
                                        <span class="absolute w-4 h-4 bg-gray-400 rounded-full right-0 bottom-0 border-2 border-white"></span>
                                    </div>
                                </div>
                                <div class="flex-1 px-2">
                                    <div>
                                        <p>${message.senderName}</p>
                                    </div>
                                    ${showContent}
                                    <div class="pl-4"><small class="text-gray-500">${formatDate(
                                      message.createAt
                                    )}</small></div>
                                </div>
                            </div>
                        `;
            $("#chatConversation").append(html);
            scrollToBottomMessages();
          } else {
            if (message.sender !== myMemberInConversationSelected.id) {
              $(`#notify_${message.conversationId}`).remove();
              let htmlNotify = `
                            <div id="notify_${message.conversationId}" class="unread-message">
                                    <span class="badge badge-soft-danger rounded-pill">new</span>
                                </div>`;

              $(`#conversationID_${message.conversationId}`).append(htmlNotify);
            }
          }

          $(`#notifyMessage_${message.conversationId}`).remove();

          if (message.type === "text") {
            notifyLastMessageHistory = message.content;
          } else {
            notifyLastMessageHistory = "đã gửi cho bạn file ";
          }
          let htmlMessageNotify = `
                        <p id="notifyMessage_${message.conversationId}" class="chat-user-message mb-0">${message.senderName}: ${notifyLastMessageHistory}</p>
                    `;
          $(`#conversation_messageNotify_${message.conversationId}`).append(
            htmlMessageNotify
          );
        }
      );
    }, 200);
  });
};

// send Messaage

function sendMessage(member, type, content, conversation) {
  const body = {
    sender: member.id,
    avatarSender: user.avatar,
    content: content,
    type: type,
    conversationId: conversation.id,
    senderName: member.nameUser,
  };

  stompClient.send("/app/chat/" + conversation.id, {}, JSON.stringify(body));
  let showContent = "";

  if (type === "image") {
    showContent += `<div class="ctext-wrap-content">
      <ul class="list-inline message-img  mb-0">
          <li class="list-inline-item message-img-list me-2 ms-0 w-50">
              <div>
                  <a class="popup-img d-inline-block m-1" href="${content}" title="Project 1">
                      <img src="${content}" alt="" class="rounded border" style="width:150;height:100px">
                  </a>
              </div>
              <div class="message-img-link">
                  <ul class="list-inline mb-0">
                      <li class="list-inline-item">
                          <a href="#">
                              <i class="ri-download-2-line"></i>
                          </a>
                      </li>
                      <li class="list-inline-item dropdown">
                          <a class="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              <i class="ri-more-fill"></i>
                          </a>
                          <div class="dropdown-menu">
                              <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-end text-muted"></i></a>
                              <a class="dropdown-item" href="#">Save <i class="ri-save-line float-end text-muted"></i></a>
                              <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-end text-muted"></i></a>
                              <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-end text-muted"></i></a>
                          </div>
                      </li>
                  </ul>
              </div>
          </li>


      </ul>
  </div>
  <div class="pr-4"><small class="text-gray-500">${formatDate(
    new Date().toString()
  )}</small></div>`;
  } else if (type === "listImage") {
    const listImage = content.split("+");
    console.log(listImage);
    let listImageRender = "";

    listImage.forEach((itemImage) => {
      listImageRender += `<div>
      <a class="popup-img d-inline-block m-1"
          href="${itemImage}"
          title="Project 1">
          <img src="${itemImage}"
              alt="" class="rounded border"
              style="width:150px;height:100px">
      </a>
  </div>`;
    });
    showContent += `<div class="ctext-wrap-content">
    <ul class="list-inline message-img  mb-0 " style="
    display: flex;
    flex-direction: column;
    float: right;
    width: 100%;
    ">
        <li class="list-inline-item message-img-list me-2 ms-0 "
            style="display: flex;flex-wrap: wrap;justify-content: flex-end;">
              ${listImageRender}
        </li>

        <div class="message-img-link">
            <ul class="list-inline mb-0">
                <li class="list-inline-item">
                    <a href="#">
                        <i class="ri-download-2-line"></i>
                    </a>
                </li>
                <li class="list-inline-item dropdown">
                    <a class="dropdown-toggle" href="#" role="button"
                        data-bs-toggle="dropdown" aria-haspopup="true"
                        aria-expanded="false">
                        <i class="ri-more-fill"></i>
                    </a>
                    <div class="dropdown-menu">
                        <a class="dropdown-item" href="#">Copy <i
                                class="ri-file-copy-line float-end text-muted"></i></a>
                        <a class="dropdown-item" href="#">Save <i
                                class="ri-save-line float-end text-muted"></i></a>
                        <a class="dropdown-item" href="#">Forward <i
                                class="ri-chat-forward-line float-end text-muted"></i></a>
                        <a class="dropdown-item" href="#">Delete <i
                                class="ri-delete-bin-line float-end text-muted"></i></a>
                    </div>
                </li>
            </ul>
        </div>


        <div class="pr-4"><small class="text-gray-500">${formatDate(
          new Date().toString()
        )}</small></div>
    </ul>
</div>`;
  } else if (type === "file") {
    const inforFile = content.split("+");
    showContent += `
                  <div class="inline-block p-2 px-6 " style ="background-color:#E4E6EB;color:black;border-radius: 7px;">
                  <a href=${
                    inforFile[2]
                  } style="display: flex;text-align: center;">
                                <div style="border-radius:50%;background-color:rgba(0, 0, 0, 0.05);width:30px">
                                    <i class="fas fa-file-csv" style="position: relative;top: 7px;"> </i>
                                </div> 
                                <div style="padding-left:5px">
                                    <span style="display: block;">${
                                      inforFile[0]
                                    }</span>
                                    <span style="float: left;font-weight: 100;font-size: 11px;">
                                            ${inforFile[1]}
                                    </span>
                                </div>
                            </div>
                            
                            </a>
                            <div class="pl-4"><small class="text-gray-500">${formatDate(
                              new Date().toString()
                            )}</small></div>
                        `;
  } else {
    showContent += `
    <div class="inline-block bg-blue-600 rounded-full p-2 px-6 text-white">
    <span>${content}</span>
    </div>
    <div class="pr-4"><small class="text-gray-500">${formatDate(
      new Date().toString()
    )}</small></div>
    `;
  }

  const html = `
        <div class="message me mb-4 flex text-right">
            <div class="flex-1 px-2">
                    ${showContent}
            </div>
        </div>
    `;

  let htmlMessageNotify = `
        <p id="notifyMessage_${conversation.id}" class="chat-user-message mb-0">${member.nameUser}: ${content}</p>
    `;

  $(`#notifyMessage_${conversation.id}`).remove();
  $(`#conversation_messageNotify_${conversation.id}`).append(htmlMessageNotify);

  $("#chatConversation").append(html);
  scrollToBottomMessages();
  $("#message-to-send").val("");
}

//gửi tin nhắn

const handleSendMessage = () => {
  const content = $("#message-to-send").val();
  sendMessage(
    myMemberInConversationSelected,
    "text",
    content,
    conversationSelected
  );
};

// $("#sendBtn").click(() => {
//   handleSendMessage();
// });

(() => {
  $("#message-to-send").on("keyup", addMessageEnter.bind(this));
})();

function addMessageEnter(event) {
  if (event.keyCode === 13) {
    handleSendMessage();
  }
}

function scrollToBottomMessages() {
  var container = document.querySelector(
    "#divConversation .simplebar-content-wrapper"
  );
  container.scrollTo({ top: 100000, behavior: "smooth" });
}

//handle add member in group
$(function () {
  $("#btnAddFriendInGroupChat").on("click", function () {
    // console.log(conversationSelected.id);
    let idUser = $('input[name="friend"]:checked').val();

    const data = {
      userId: idUser,
      conversationId: conversationSelected.id,
    };

    console.log(data);
    $.ajax({
      url: `${api}/conversations/addMemberInGroup`,
      type: "POST",
      data: JSON.stringify(data),
      async: true,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      success: function (result) {
        console.log(result);
        //location.reload();

        $.ajax({
          url: `${api}/conversations/addConversationInUser`,
          type: "POST",
          data: JSON.stringify(data),
          async: true,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
          },
          success: function (result1) {
            console.log(result1);

            alert("Thành công");
            window.location.reload();
            //location.reload();
          },
        });
      },
    });
  });
});
function getLeaveConversation() {
  var name;
  let checkAdmin;
  const getUser = localStorage.getItem("userId");
  const admin = conversationSelected.admin;
  checkAdmin = getUser === admin ? true : false;

  if (checkAdmin) {
    $("#changeAdmin-exampleModal").modal("toggle");
  } else {
    $.ajax({
      url: `${api}/members/${conversationSelected.id}`,
      type: "GET",
      async: true,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      success: function (result) {
        user = result;
        console.log(user);
        user.map((userId) => {
          if (userId.userId == getUser) {
            name = userId.id;
          }
        });
        let body = {
          userId: getUser,
          conversationId: conversationSelected.id,
          memberId: name,
        };
        let leaveConversationInUser = {
          userId: getUser,
          conversationId: conversationSelected.id,
        };
        console.log(body);

        $.ajax({
          url: `${api}/conversations/leaveConversation`,
          type: "POST",
          data: JSON.stringify(body),
          async: true,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
          },
          success: function (result) {
            console.log(result);

            $.ajax({
              url: `${api}/conversations/leaveConversationInUser`,
              type: "POST",
              data: JSON.stringify(leaveConversationInUser),
              async: true,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
              },
              success: function (result1) {
                console.log(result1);
                alert("Rời nhóm thành công");
                window.location.reload();
              },
            });
          },
        });
      },
    });
  }
}
function handleFindMemberUsingAddInGroup() {
  //Tìm conversationId trong danh sách member.
  $.ajax({
    url: `${api}/members/${conversationSelected.id}`,
    type: "GET",
    async: true,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
    },
    success: function (result) {
      console.log(result);
      var listUserIdInMember = [];
      result.map((member) => {
        listUserIdInMember.push(member.userId);
      });
      console.log(listUserIdInMember);

      //lấy danh sách bạn bè
      $.ajax({
        url: `${api}/contacts/user/${localStorage.getItem("userId")}`,
        type: "GET",
        async: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Content-Type", "application/json");
        },
        success: function (result) {
          //lưu danh sách bạn bè theo Id
          var friends = [];
          result.map((myFriend) => {
            friends.push(myFriend.friendId);
          });
          // kiểm tra nếu trong danh sách bạn bè không ở trong conversation thì lấy ra Id
          var listMember = $.grep(friends, function (el) {
            return $.inArray(el, listUserIdInMember) == -1;
          });
          console.log(listMember);
          var user = [];
          listMember.map((userId) => {
            console.log(userId);
            $.ajax({
              url: `${api}/users/${userId}`,
              type: "GET",
              async: true,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
              },
              success: function (result) {
                var htmlFriends = "";
                let friend = result;
                htmlFriends = `
                                <li>
                                         <div class="form-check">
                                             <input type="radio" name="friend" value="${friend.id}" class="form-check-input" id="contact_${user.friendId}">
                                             <label class="form-check-label" for="memberCheck1">${friend.fullName}</label>
                                         </div>
                                 </li>
        
                           `;
                $("#memberaddInGroup").append(htmlFriends);
              },
            });
          });
        },
      });
    },
  });
}

function handleHideShowButtonAddFriend() {
  console.log(conversationSelected.id);
  // $.ajax({
  //     url: `${api}/conversations/user/${localStorage.getItem("userId")}`,
  //     type: "GET",
  //     async: true,
  //     beforeSend: function (xhr) {
  //         xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  //         xhr.setRequestHeader("Accept", "application/json");
  //         xhr.setRequestHeader("Content-Type", "application/json");
  //     },
  //     success: function (result) {
  //         console.log(result);
  //         result.map((conversation) => {
  //             if (conversation.id == conversationSelected.id) {
  //                 //   if(conversation.typeChat==false){
  //                 //     $('#addFriendGroup').css('display', 'none');
  //                 //     console.log("kq sai")
  //                 //     // $("#elemen").hidden = truet_to_hide
  //                 //   }
  //                 // }
  //                 // if(conversation.id==conversationSelected.id){
  //                 //   if(conversation.typeChat==true){
  //                 //     $('#addFriendGroup').show()
  //                 //     console.log("kq dung")
  //                 //     // $("#elemen").hidden = truet_to_hide
  //                 //   }
  //                 conversation.typeChat == false
  //                     ? $("#addFriendGroup").css("display", "none")
  //                     : $("#addFriendGroup").show();
  //                 conversation.typeChat == false
  //                     ? $("#leaveConversation").css("display", "none")
  //                     : $("#leaveConversation").show();
  //             }
  //         });
  //     },
  // });
}

function disbandingtheGroup() {
  let checkAdmin;

  const userId = localStorage.getItem("userId");
  const admin = conversationSelected.admin;

  checkAdmin = userId === admin ? true : false;

  if (checkAdmin) {
    $.ajax({
      url: `${api}/conversations/delete/${conversationSelected.id}`,
      type: "PUT",
      async: true,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      success: function (result) {
        window.location.reload();
      },
    });
  } else {
  }
}

function handleChangeAdmin() {
  const value = $('input[name="selectAdmin"]:checked').val();

  const bodyUpdateAdmin = {
    id: conversationSelected.id,
    groupName: conversationSelected.groupName,
    memberInGroup: conversationSelected.memberInGroup,
    messages: conversationSelected.messages,
    typeChat: conversationSelected.typeChat,
    admin: value,
  };

  $.ajax({
    url: `${api}/conversations/updateAdmin`,
    type: "PUT",
    data: JSON.stringify(bodyUpdateAdmin),
    async: true,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
    },
    success: function (result1) {
      // console.log(result1);
      alert("Đã chuyển quyền admin");
      window.location.reload();
    },
  });
}

$(document).ready(function() {
    const chatMenu = $('#chat-menu');
    const friendList = $('#friend-list');
    const chatHeader = $('.chat-header');
    const messageArea = $('.message-area');
    const messageInput = $('#message-input');
    const sendButton = $('#send-button');
    const genButton = $('#gen-button');
    let currentFriend = null;

    // 初始设置聊天菜单项为激活状态
    chatMenu.addClass('active');

    function loadChatList() {
        $.get('http://127.0.0.1:5000/get_chat_list', function(data) {
            friendList.empty();
            data.forEach(friend => {
                const friendItem = $(`
                    <div class="friend" data-name="${friend.name}">
                        <img src="${friend.avatar}" alt="${friend.name}">
                        <span>${friend.name}</span>
                        ${friend.unread > 0 ? '<span class="unread-dot"></span>' : ''}
                    </div>
                `);
                friendList.append(friendItem);
            });
        });
    }

    function loadCurrentChat(name) {
        $.get('http://127.0.0.1:5000/get_curr_chat', { name: name }, function(data) {
            messageArea.empty();
            data.forEach(message => {
                const alignment = message.sender === 'self' ? 'right;margin-left: 20%;background: #95ec69; padding: 8px; border-radius: 5px;' : 'left;width: 80%';
                const messageItem = $(`<p style="text-align: ${alignment};"> ${message.content}</p>`);
                messageArea.append(messageItem);
            });
        });
    }

    friendList.on('click', '.friend', function() {
        // 移除其他好友的激活状态
        $('.friend').removeClass('active');
        // 激活当前点击的好友
        $(this).addClass('active');

        currentFriend = $(this).data('name');
        chatHeader.text(currentFriend);
        loadCurrentChat(currentFriend);
        //setInterval(() => loadCurrentChat(currentFriend), 3000);
    });

    sendButton.click(function() {
        const message = messageInput.val();
        if (message && currentFriend) {
            $.ajax({
                url: 'http://127.0.0.1:5000/send_curr_msg',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    message: message,
                    who: currentFriend
                }),
                success: function() {
                    loadCurrentChat(currentFriend);
                    messageInput.val('');
                },
                error: function(xhr, status, error) {
                    console.error("发送消息时发生错误:", error);
                }
            });
        }
    });

    genButton.click(function() {
        const message = messageInput.val();
        if (currentFriend) {
            $.ajax({
                url: 'http://127.0.0.1:5000/get_replay_msg',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    message: message,
                    who: currentFriend
                }),
                success: function(response) {
                    const content = response.content;
                    messageInput.val('');  // 清空输入框
                    let i = 0;
                    
                    function displayNextChar() {
                        if (i < content.length) {
                            messageInput.val(function(index, val) {
                                return val + content[i];
                            });
                            i++;
                            setTimeout(displayNextChar, 50);  // 每50毫秒显示一个字符
                        }
                    }

                    displayNextChar();  // 开始显示字符
                },
                error: function(xhr, status, error) {
                    console.error("生成回答时发生错误:", error);
                }
            });
        }
    });


    loadChatList();
    //setInterval(loadChatList, 3000);
});


$(document).ready(function() {
    $('.menu-item').click(function() {
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        // 隐藏所有内容区域
        $('.container').hide();

        // 根据点击的菜单项显示对应的内容
        switch ($(this).attr('id')) {
            case 'chat-menu':
                $('#chat-content').show();
                $('#sidebar').show();
                break;
            case 'add-friend-menu':
                $('#add-friend-content').show();
                $('#sidebar').hide();
                break;
            case 'comment-menu':
                $('#comment-content').show();
                $('#sidebar').hide();
                break;
            case 'control-menu':
                $('#control-content').show();
                $('#sidebar').hide();
                break;
            case 'settings-menu':
                $('#settings-content').show();
                $('#sidebar').hide();
                break;
        }
    });
});
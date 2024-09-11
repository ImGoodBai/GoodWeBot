$(document).ready(function() {
    const chatMenu = $('#control-menu');
    const friendList_auto = $('#friend-list-autochat');
    const friendList = $('#friend-list');
    const chatHeader = $('.chat-header');
    const messageArea = $('.message-area');
    const messageInput = $('#message-input-autochat');  // 修正选择器错误
    const sendButton = $('#send-button');
    const genButton = $('#gen-button');
    let currentFriend = null;

    function loadChatList_auto2() {
        $.get('http://127.0.0.1:5000/get_chat_list', function(data) {
            friendList_auto.empty();
            data.forEach(friend => {
                if (friend.unread > 0) { // 只有未读消息数大于0时才处理
                    const friendItem = $(`
                        <div class="friend" data-name="${friend.name}">
                            <img src="${friend.avatar}" alt="${friend.name}">
                            <span>${friend.name}</span>
                            ${friend.unread > 0 ? '<span class="unread-dot"></span>' : ''}
                        </div>
                    `);
                    friendList_auto.append(friendItem);
                }
            });
        });
    }
    function loadChatList_auto() {
        $.get('http://127.0.0.1:5000/get_chat_list', function(data) {
            const firstFriend = data[0];
            if (firstFriend) {
                // 将第一个项目的名字赋值给指定的 <span id="nickname">
                $('#nickname').text(firstFriend.name);
            }
            friendList_auto.empty();
            data.forEach((friend, index) => {
                // 从第二个项目开始，即 index >= 1
                if (index >= 1) {
                    const friendItem = $(`
                        <div class="friend" data-name="${friend.name}">
                            <img src="${friend.avatar}" alt="${friend.name}">
                            <span>${friend.name}</span>
                            ${friend.unread > 0 ? '<span class="unread-dot"></span>' : ''}
                        </div>
                    `);
                    friendList_auto.append(friendItem);
                }
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

    function registerFriendClickHandler() {
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
    }
    function registerFriendClickHandler_auto() {
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
    }

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

    $('.menu-item').click(function() {
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        // 隐藏所有内容区域
        $('.container').hide();

        // 根据点击的菜单项显示对应的内容
        switch ($(this).attr('id')) {
            case 'control-menu':
                $('#control-content').show();
                $('#sidebar').hide();
                
                // 在点击control-menu时加载好友列表和注册事件处理程序
                loadChatList_auto();
                registerFriendClickHandler_auto();
                break;
            case 'add-friend-menu':
                $('#add-friend-content').show();
                $('#sidebar').hide();
                break;
            case 'comment-menu':
                $('#comment-content').show();
                $('#sidebar').hide();
                break;
            case 'settings-menu':
                $('#settings-content').show();
                $('#sidebar').hide();
                break;
        }
    });
});

$(document).ready(function() {
    let isControlActive = false;

    $('#autochat').click(function() {
        isControlActive = !isControlActive;

        if (isControlActive) {
            // 改变按钮文本和禁用选项
            $('#toggle-control').text('停止接管');
            $('#ai-mode').prop('disabled', true);
            $('#chat-scope').prop('disabled', true);
        } else {
            // 恢复按钮文本和启用选项
            $('#toggle-control').text('开始接管');
            $('#ai-mode').prop('disabled', false);
            $('#chat-scope').prop('disabled', false);
        }
    });
});


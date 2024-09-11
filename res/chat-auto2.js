$(document).ready(function() {
    const chatMenu = $('#control-menu');
    const friendList = $('#friend-list-autochat');
    const chatHeader = $('#chat-header-autochat');
    const messageArea = $('.message-area');
    const messageInput = $('#message-input-autochat');  // 修正选择器错误
    const sendButton = $('#send-button-autochat');
    const genButton = $('#gen-button-autochat');
    const accept_newf = $('#accept-newf');
    const add_newf = $('#add-newf');
    const setup_menu = $('#settings-menu');
    running = false
    let currentFriend = null;
    interval = null;

    function loadChatList_auto() {
        $.get('http://127.0.0.1:5001/get_chat_list', function(data) {
            const firstFriend = data[0];
            if (firstFriend) {
                // 将第一个项目的名字赋值给指定的 <span id="nickname">
                $('#nickname').text(firstFriend.name);
            }
            friendList.empty();
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
                    friendList.append(friendItem);
                }
            });
        });
    }

    function loadCurrentChat(name) {
        running = true
        console.log('running value1 '+running);
        messageArea.empty();
        $.get('http://127.0.0.1:5001/get_curr_chat', { name: name }, function(data) {
            data.forEach(message => {
                const alignment = message.sender === 'self' ? 'right;margin-left: 20%;background: #95ec69; padding: 8px; border-radius: 5px;' : 'left;width: 80%';
                const messageItem = $(`<p style="text-align: ${alignment};"> ${message.content}</p>`);
                messageArea.append(messageItem);
            });
            running = false
            console.log('running value2 '+running);
        });
    }
    function registerFriendClickHandler_auto() {
        friendList.find('.friend').each(function() {
            // 判断是否已经绑定过 click 事件
            if (!$(this).data('click-bound')) {
                $(this).on('click', function() {
                    $('.friend').removeClass('active');
                    $(this).addClass('active');
                    currentFriend = $(this).data('name');
                    appendLogWithDate("好友：" + currentFriend, '#logbar-list-autochat');
                    chatHeader.text(currentFriend);
                    loadCurrentChat(currentFriend);
                    //setInterval(() => loadCurrentChat(currentFriend), 3000);
                });
    
                // 标记已经绑定了 click 事件
                $(this).data('click-bound', true);
            }
        });
    }
    
    function registerFriendClickHandler_auto() {
        friendList.on('click', '.friend', function() {
            if (!$(this).data('click-bound')) {
                $('.friend').removeClass('active');
                $(this).addClass('active');
                currentFriend = $(this).data('name');
                appendLogWithDate("好友："+currentFriend,'#logbar-list-autochat');
                chatHeader.text(currentFriend);
                loadCurrentChat(currentFriend);
                $(this).data('click-bound', true);
                //setInterval(() => loadCurrentChat(currentFriend), 3000);
            }
        });
    }

    sendButton.click(function() {
        running = true
        console.log('running value5 '+running);
        const message = messageInput.val();
        appendLogWithDate("开始发送消息；",'#logbar-list-autochat');
        appendLogWithDate(">>>"+message,'#logbar-list-autochat');
        if (message && currentFriend) {
            $.ajax({
                url: 'http://127.0.0.1:5001/send_curr_msg',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    message: message,
                    who: currentFriend
                }),
                success: function() {
                    loadCurrentChat(currentFriend);
                    messageInput.val('');
                    running = false
                    console.log('running value6 '+running);                },
                error: function(xhr, status, error) {
                    console.error("发送消息时发生错误:", error);
                    running = false
                }
            });
        }

    });

    genButton.click(function() {
        running = true
        console.log('running value3 '+running);
        const content = $('#message-area-autochat p:last').text();
        appendLogWithDate("请求AI生成回答；",'#logbar-list-autochat');
        if (currentFriend) {
            $.ajax({
                url: 'http://127.0.0.1:5001/get_replay_msg',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    message: content,
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
                            setTimeout(displayNextChar, 20);  // 每50毫秒显示一个字符
                        }else{
                            running = false                    
                            console.log('running value4 '+running);                          }
                    }
                    displayNextChar();  // 开始显示字符
                },
                error: function(xhr, status, error) {
                    running = false
                    console.error("生成回答时发生错误:", error);
                }
            });
        }
    });
    accept_newf.click(function() {
        const message = messageInput.val();
        const accept_addtag = $('#accept-addtag').val();
        const accept_addremark = $('#accept-addremark').val();
        messageInput_accept1 = $('#logbar-list-accept_newf');

        appendLogWithDate("开始自动接受好友申请；",'#logbar-list-accept_newf');
        if (1) {
            $.ajax({
                url: 'http://127.0.0.1:5001/process_new_friends',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    addtag: accept_addtag,
                    addremark: accept_addremark,                    
                }),
                success: function(response) {
                    const content = response.content;
                    let i = 0;  
                    function displayNextChar() {
                        if (i < content.length) {
                            messageInput_accept1.append(function(index, val) {
                                return content[i];
                            });
                            i++;
                            setTimeout(displayNextChar, 20);  // 每50毫秒显示一个字符
                        }
                    }
                    displayNextChar();  // 开始显示字符
                },
                error: function(xhr, status, error) {
                    console.error("发生错误:", error);
                }
            });
        }
    });

    add_newf.click(function() {
        const message = messageInput.val();
        const add_subject = $('#add-subject').val();
        const add_addtag = $('#add-addtag').val();
        const add_addremark = $('#add-addremark').val();
        const add_idlist = $('#message-input-add').val();
        messageInput_accept1 = $('#logbar-list-add');

        appendLogWithDate("开始自动发送好友申请；",'#logbar-list-add');
        if (1) {
            $.ajax({
                url: 'http://127.0.0.1:5001/add_new_friends',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    addsubject: add_subject,
                    addtag: add_addtag,
                    addidlist: add_idlist,
                    addremark: add_addremark,                    
                }),
                success: function(response) {
                    const content = response.content;
                    let i = 0;
                    
                    function displayNextChar() {
                        if (i < content.length) {
                            messageInput_accept1.append(function(index, val) {
                                return content[i];
                            });
                            i++;
                            setTimeout(displayNextChar, 20);  // 每50毫秒显示一个字符
                        }
                    }

                    displayNextChar();  // 开始显示字符
                },
                error: function(xhr, status, error) {
                    console.error("发生错误:", error);
                }
            });
        }
    });

    $('.menu-item').click(function() {
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        $('.container').hide();

        switch ($(this).attr('id')) {
            case 'control-menu':
                $('#control-content').show();
                $('#sidebar').hide();             
                loadChatList_auto();
                registerFriendClickHandler_auto();
                break;
            case 'add-friend-menu':
                $('#add-friend-content').show();
                $('#sidebar').hide();
                break;
            case 'accept-friend-menu':
                $('#accept-friend-content').show();
                $('#sidebar').hide();
                break;
            case 'comment-menu':
                $('#comment-content').show();
                $('#sidebar').hide();
                break;
            case 'settings-menu':
                $('#settings-content').show();
                $('#sidebar').hide();
                getAgentInfo(); // get表单信息
                break;
        }
    });
    chatMenu.click();
});
$(document).ready(function() {
    let isControlActive = false;

   // 显示蒙版
function showOverlay() {
    $('#overlay').show();
}

// 隐藏蒙版
function hideOverlay() {
    $('#overlay').hide();
}

// 监听空格键按下，取消操作
$(document).on('keydown', function(e) {
    if (e.key === ' ') { // 检测空格键
        e.preventDefault(); // 阻止空格键触发默认事件（如按钮点击）
        if (isControlActive) {
            isControlActive = false; // 终止操作
            hideOverlay();
            clearInterval(interval); // 停止批量处理
            $('#autochat').text('AI批量回复未读消息'); // 恢复按钮文本
            $('#ai-mode').prop('disabled', false);
            $('#chat-scope').prop('disabled', false);
            console.log('操作已取消');
        }
    }
});

$('#autochat').click(function() {
    alert('批量回复功能暂停，先点击“生成回答”手动使用');
    return;
    if (!isControlActive) {
        // 启动操作
        isControlActive = true;
        $('#autochat').text('停止接管');
        $('#ai-mode').prop('disabled', true);
        $('#chat-scope').prop('disabled', true);

        // 显示蒙版
        showOverlay();

        // 启动遍历操作，传入当前好友列表项
        const friendItems = $('#friend-list-autochat .friend');
        processAllFriends(friendItems); // 这里是处理好友列表的函数
        console.log("### 好友列表长度：" + friendItems.length);
    } else {
        // 停止操作
        isControlActive = false;
        $('#autochat').text('AI批量回复未读消息');
        $('#ai-mode').prop('disabled', false);
        $('#chat-scope').prop('disabled', false);
        clearInterval(interval); // 停止操作

        // 隐藏蒙版
        hideOverlay();
    }
});



    function simulateClick(selector) {
        $(selector).trigger('click');
    }

function processFriend(friendItem, callback) {
    // 模拟点击好友列表项
    simulateClick(friendItem);
    console.log("点击好友列表项后等待 running 变为1 false");
    waitForRunning(function() {
        simulateClick('#gen-button-autochat');
        console.log("点击生成消息按钮后等待 running 变为2 false");
        waitForRunning(function() {
            simulateClick('#send-button-autochat');
            console.log("点击发送消息按钮后等待 running 变为3 false");
            waitForRunning(function() {
                if (callback) {
                    callback();
                }
            });
        });
    });
}

function waitForRunning(callback) {
    interval = setInterval(function() {
        console.log(" running 变为:"+running);
        if (!running) {
            clearInterval(interval);
            callback();
        }
    }, 1000); // 每隔 100 毫秒检查一次 running 的值
}

    // 定义一个函数来循环处理所有好友
    function processAllFriends(friendItems) {
        let index = 0;

        function processNextFriend() {
            console.log("### 当前好友列表: "+index);
            if (index < friendItems.length) {
                const friendItem = friendItems[index];
                processFriend(friendItem, function() {
                    index++;
                    processNextFriend(); // 继续处理下一个好友
                });
            } else {
                // 所有好友处理完毕后，停止接管
                $('#autochat').text('AI批量回复未读消息');
                $('#ai-mode').prop('disabled', false);
                $('#chat-scope').prop('disabled', false);
                isControlActive = false; // 标记为已停止
            }
        }

        processNextFriend();
    }
});
function appendLogWithDate(logString,index) {
    let currentdate = new Date();
    const logbarlist = $(index);
  
    let formattedDate = currentdate.getFullYear() + '-' + 
                        String(currentdate.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(currentdate.getDate()).padStart(2, '0') + ' ' + 
                        String(currentdate.getHours()).padStart(2, '0') + ':' + 
                        String(currentdate.getMinutes()).padStart(2, '0');

    let logEntry = '<p>'+formattedDate + ' ' + logString+'</p>';
    logbarlist.prepend(logEntry);
}

function getAgentInfo() {
    $.ajax({
        url: 'http://127.0.0.1:5001/get_agent_info',
        type: 'POST',
        success: function (response) {
            $('#coze_api_base').val(response.coze_api_base);
            $('#coze_bot_id').val(response.coze_bot_id);
            $('#coze_token').val(response.coze_token);
            $('#aiwis_api_base').val(response.aiwis_api_base);
            $('#aiwis_api_key').val(response.aiwis_api_key);
            $('#openai_api_base').val(response.openai_api_base);
            $('#openai_api_key').val(response.openai_api_key);
            $('#message-input-userprompt').val(response.user_prompt);
          
            if (response.api_choice === 'coze') {
                $('#coze_api').prop('checked', true);
            } else if (response.api_choice === 'aiwis') {
                $('#aiwis_api').prop('checked', true);
            } else if (response.api_choice === 'openai') {
                $('#openai_api').prop('checked', true);
            }

            //alert('配置信息获取成功！');
        },
        error: function () {
            alert('获取配置信息失败，请检查网络或服务器设置。');
        }
    });
}

function setAgentInfo() {
    user_prompt = $('#message-input-userprompt').val()
    user_prompt = user_prompt.replace(/'/g, '"');
    const data = {
        api_choice: $('input[name="api_choice"]:checked').val(),
        coze_api_base: $('#coze_api_base').val(),
        coze_bot_id: $('#coze_bot_id').val(),
        coze_token: $('#coze_token').val(),
        aiwis_api_base: $('#aiwis_api_base').val(),
        aiwis_api_key: $('#aiwis_api_key').val(),
        openai_api_base: $('#openai_api_base').val(),
        openai_api_key: $('#openai_api_key').val(),
        user_prompt: user_prompt
    };

    $.ajax({
        url: 'http://127.0.0.1:5001/set_agent_info',
        type: 'POST',
        data: JSON.stringify(data),  // 将数据序列化为JSON
        contentType: 'application/json; charset=utf-8',
        success: function () {
            alert('配置信息保存成功！');
            getAgentInfo();
        },
        error: function () {
            alert('配置信息保存失败，请检查网络或服务器设置。');
        }
    });
}
$(document).ready(function() {
    $('#setup_save2').click(function (event) {
        //event.preventDefault(); // 阻止表单默认提交行为
        setAgentInfo(); // 提交表单信息
    });
});

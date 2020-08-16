$(function(){

    var socket = io();
    var username = null;
    var message = "";
    var isTyping = true;


    $(".page-join section form").on("submit",(e)=>{
        e.preventDefault();
        let nickname = $(".page-join section form #nickname").val();
        let room = $(".page-join section form #room").val();
        if(room != "" && nickname != ""){
            join(nickname,room);
            username = nickname;  
        }
        else{
            sendError("You missing field!");
            
        }
        
    });

    function sendError(msg){
        $("<p>"+msg+"</p>").appendTo(".page-join section .msg-error");
            $(".page-join section .msg-error p").fadeOut(3000,()=>{
                $(".page-join section .msg-error p").remove();
            });
    }
    function sendMessage(data){
        if(data.append){
            if(data.user.toLowerCase() == "admin"){
                $(`<span class="admin-center">${data.user}</span><li class="msg-center">${data.text}</li>`).appendTo(".messages");
            }
            else{
                if(data.user == username){
                    $(`<span class="username-right">${data.user}</span><li class="msg-right">${data.text}</li>`).appendTo(".messages");
                   
                }
                else{
                    $(`<span class="username-left">${data.user}</span><li class="msg-left">${data.text}</li>`).appendTo(".messages");
                }
                
            }
        }
        else{

            if(data.user.toLowerCase() == "admin"){
                $(`<span class="admin-center">${data.user}</span><li class="msg-center">${data.text}</li>`).prependTo(".messages");
            }
            else{
                if(data.user == username){
                    $(`<span class="username-right">${data.user}</span><li class="msg-right">${data.text}</li>`).prependTo(".messages");
                }
                else{
                    $(`<span class="username-left">${data.user}</span><li class="msg-left">${data.text}</li>`).prependTo(".messages");
                }
                
            }

        }
        $(".messages")[0].scrollTop = $(".messages")[0].scrollHeight;
        
    }

    function join(nickname,room){
        socket.emit("join",{nickname,room},(err)=>{
            if(err){
                sendError(err);
            }
            else{
                $(".page-join").css("display","none");
                $(".page-chat").css("display","block");
                let index = room.length - 1;
                if(room[index] == "s"){
                    $(".page-chat .chat-box .head-chat .name-room h3").text(`${room}' room`);
                }
                else{
                    $(".page-chat .chat-box .head-chat .name-room h3").text(`${room}'s room`);
                }   
            }
        });
    }
    function typing(data){
        if(data.count < 1){
            $(`<span style="display:none;" id="${data.user}"></span>`).appendTo(".messages");
        }
        $(`#${data.user}`).text(`${data.user} is ${data.type} ${data.text}`).addClass("typing").fadeIn(400);
        $(".messages")[0].scrollTop = $(".messages")[0].scrollHeight;
    }

    function stopTyping(data){
            $(`#${data.user}`).remove();
        
    }



    $(".page-chat section .chat-box .head-chat .close-room").on("click",()=>{
        $(".page-chat").hide();
        $(".page-join").show();
        $(".messages").empty();
        socket.emit("left");
        
        
        
    });
    $(".page-chat section .chat-box .footer-chat button").on("click",()=>{
        if($(".page-chat section .chat-box .footer-chat input").val() != ""){
            socket.emit("sendMessage",{"text":$(".page-chat section .chat-box .footer-chat input").val()});
            $(".page-chat section .chat-box .footer-chat input").val("");
            socket.emit("stopTyping");
        }
    });

    $(".page-chat section .chat-box .footer-chat input").on("keyup",(e)=>{
        if($(".page-chat section .chat-box .footer-chat input").val() == ""){
            socket.emit("stopTyping");
        }
        if(e.which != 13 && $(".page-chat section .chat-box .footer-chat input").val()[0] != "$" && $(".page-chat section .chat-box .footer-chat input").val() != "") {
            socket.emit("typing",$(".page-chat section .chat-box .footer-chat input").val());
        }
        if(e.which == 13 && $(".page-chat section .chat-box .footer-chat input").val() != ""){
            socket.emit("sendMessage",{"text":$(".page-chat section .chat-box .footer-chat input").val()});
            $(".page-chat section .chat-box .footer-chat input").val("");
            socket.emit("stopTyping");
        }
        

    });


    socket.on("message",(data)=>{
        sendMessage(data);
    })

    socket.on("sendType",(data)=>{
        typing(data);
    });

    socket.on("stopType",(data)=>{
        stopTyping(data);
    });






});
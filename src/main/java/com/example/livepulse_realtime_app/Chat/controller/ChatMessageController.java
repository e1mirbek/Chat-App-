package com.example.livepulse_realtime_app.Chat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.livepulse_realtime_app.Chat.entity.ChatMessage;
import com.example.livepulse_realtime_app.Chat.entity.ChatNotification;
import com.example.livepulse_realtime_app.Chat.service.ChatMessageService;

import java.util.List;

@Controller
public class ChatMessageController {

    @Autowired 
    private ChatMessageService chatMessageService;

    @Autowired
    private SimpMessagingTemplate simpMessageTemplate;


    @MessageMapping("/chat")
    public void processChatMessage(@Payload ChatMessage chatMessage) {
        ChatMessage savedMessage = chatMessageService.saveChatMessage(chatMessage);
        simpMessageTemplate.convertAndSendToUser(chatMessage.getRecipientId(), "/queue/messages",
         new  ChatNotification(
                savedMessage.getId(),
                savedMessage.getSenderId(),
                savedMessage.getRecipientId(),
                savedMessage.getContent(
         )
         )
        );
    }


    @GetMapping ("/chat/{senderId}/{recipientId}")
   public ResponseEntity <List <ChatMessage>> findChatMessages (@PathVariable String senderId, @PathVariable String recipientId) {
        return ResponseEntity.ok(chatMessageService.findChatMessages(senderId, recipientId));
    }


}

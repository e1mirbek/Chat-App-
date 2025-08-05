package com.example.livepulse_realtime_app.Chat.service.implementation;


import com.example.livepulse_realtime_app.Chat.entity.ChatMessage;
import com.example.livepulse_realtime_app.Chat.repository.ChatMessageRepository;
import com.example.livepulse_realtime_app.Chat.service.ChatMessageService;
import com.example.livepulse_realtime_app.ChatRoom.service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatServiceImplementation implements ChatMessageService {


    @Autowired
    private ChatMessageRepository chatMessageRepository;


    @Autowired
    private ChatRoomService chatRoomService;


    @Override
    public ChatMessage saveChatMessage(ChatMessage chatMessage) {

        var chatId = chatRoomService.getChatRoomId(
                chatMessage.getChatId(),
                chatMessage.getRecipientId(),
                true
        ).orElseThrow();

        chatMessage.setChatId(chatId);
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }



    @Override
    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        var chatId = chatRoomService.getChatRoomId(senderId, recipientId, false);
        return chatId.map(chatMessageRepository::findByChatId).orElse(new ArrayList<>());
    }



}

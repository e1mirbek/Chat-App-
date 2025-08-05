package com.example.livepulse_realtime_app.Chat.service;


import com.example.livepulse_realtime_app.Chat.entity.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChatMessageService {

    ChatMessage saveChatMessage (ChatMessage chatMessage);

    List <ChatMessage> findChatMessages (String senderId, String recipientId);


}

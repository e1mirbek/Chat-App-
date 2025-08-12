package com.example.livepulse_realtime_app.Chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.livepulse_realtime_app.Chat.entity.ChatMessage;


@Repository
public interface ChatMessageRepository extends JpaRepository <ChatMessage, Long> {


    List <ChatMessage> findByChatId (String chatId);

}

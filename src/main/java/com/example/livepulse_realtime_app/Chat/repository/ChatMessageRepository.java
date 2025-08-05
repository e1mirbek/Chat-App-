package com.example.livepulse_realtime_app.Chat.repository;

import com.example.livepulse_realtime_app.Chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ChatMessageRepository extends JpaRepository <ChatMessage, Long> {


    List <ChatMessage> findByChatId (String chatId);



}

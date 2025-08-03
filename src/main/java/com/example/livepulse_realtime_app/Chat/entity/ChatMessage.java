package com.example.livepulse_realtime_app.Chat.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Table (name = "chat_message")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private  String chatId;
    private String senderId;
    private String recipientId;
    private String content;
    private Date timestamp;

}

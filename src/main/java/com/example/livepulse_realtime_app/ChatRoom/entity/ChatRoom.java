package com.example.livepulse_realtime_app.ChatRoom.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_room")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String chatId;
    private String senderId;
    private String recipientId;

}

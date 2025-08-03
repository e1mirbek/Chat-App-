package com.example.livepulse_realtime_app.Chat.entity;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatNotification {

    private Long id;
    private String senderId;
    private String recipientId;
    private String content;

}

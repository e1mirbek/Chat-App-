package com.example.livepulse_realtime_app.ChatRoom.service;


import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public interface ChatRoomService {


    Optional <String> getChatRoomId (String senderId, String recipientId, boolean createNewRoomIfNotExists);

}

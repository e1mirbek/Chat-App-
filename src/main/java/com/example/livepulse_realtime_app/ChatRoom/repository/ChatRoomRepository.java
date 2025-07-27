package com.example.livepulse_realtime_app.ChatRoom.repository;


import com.example.livepulse_realtime_app.ChatRoom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository <ChatRoom, Long> {

    Optional<ChatRoom> findBySenderIdAndRecipientId (String senderId, String recipientId);

}

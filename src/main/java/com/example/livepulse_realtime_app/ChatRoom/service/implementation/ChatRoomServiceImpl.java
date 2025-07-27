package com.example.livepulse_realtime_app.ChatRoom.service.implementation;


import com.example.livepulse_realtime_app.ChatRoom.entity.ChatRoom;
import com.example.livepulse_realtime_app.ChatRoom.repository.ChatRoomRepository;
import com.example.livepulse_realtime_app.ChatRoom.service.ChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatRoomServiceImpl implements ChatRoomService {


    @Autowired
    private ChatRoomRepository chatRoomRepository;


    @Override
    public Optional<String> getChatRoomId(String senderId, String recipientId, boolean createNewRoomIfNotExists) {
        return chatRoomRepository.findBySenderIdAndRecipientId(senderId, recipientId).map(ChatRoom::getChatId).or(() -> {
            if (createNewRoomIfNotExists) {
                var chatId = createChatId (senderId, recipientId);
                return Optional.of(chatId);
            }
            return Optional.empty();
        });
    }

    private String createChatId(String senderId, String recipientId) {
        var chatId = String.format("%s_%s", senderId, recipientId); // формат отправки user пример : Abdumanapov_Elmirbek

         ChatRoom senderRecipient = ChatRoom.builder().chatId(chatId).senderId(recipientId).recipientId(senderId).build(); // для одного user
         ChatRoom recipientSender = ChatRoom.builder().chatId(chatId).senderId(recipientId).recipientId(senderId).build();   // для второго

         chatRoomRepository.save(senderRecipient);
         chatRoomRepository.save(recipientSender);
         return chatId;
    }


}

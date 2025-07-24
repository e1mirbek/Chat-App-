package com.example.livepulse_realtime_app.User.service;


import com.example.livepulse_realtime_app.User.entity.Status;
import com.example.livepulse_realtime_app.User.entity.User;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public interface UserService {

    // Сохраняет пользователя в базу данных

    void saveUser (User user);

    // Обновляет статус пользователя на OFFLINE (например, при отключении)

    void disconnect(User user);

    // Возвращает всех пользователей с указанным статусом (ONLINE или OFFLINE)

    List<User> findAllByStatus (Status status);

    // Находит пользователя по имени пользователя (username)

    User findByUsername (String username);


}

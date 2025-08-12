package com.example.livepulse_realtime_app.User.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.example.livepulse_realtime_app.User.entity.User;

@Service
public interface UserService  extends UserDetailsService {

    // Сохраняет пользователя в базу данных

    void saveUser (User user);

    // Обновляет статус пользователя на OFFLINE (например, при отключении)

    void disconnect(User user);

    // Возвращает всех пользователей с указанным статусом (ONLINE или OFFLINE)

    List<User> findAllByStatus ();

    // Находит пользователя по имени пользователя (username)

    User findByUsername (String username);


}

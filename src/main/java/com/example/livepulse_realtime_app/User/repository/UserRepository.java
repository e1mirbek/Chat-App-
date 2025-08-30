package com.example.livepulse_realtime_app.User.repository;

import com.example.livepulse_realtime_app.User.entity.Status;
import com.example.livepulse_realtime_app.User.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Найти всех по статусу
    List<User> findAllByStatus(Status status);

    // Найти одного по username
    User findByUsername(String username);
}

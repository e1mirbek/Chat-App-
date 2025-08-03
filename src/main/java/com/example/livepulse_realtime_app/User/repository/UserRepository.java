package com.example.livepulse_realtime_app.User.repository;


import com.example.livepulse_realtime_app.User.entity.Status;
import com.example.livepulse_realtime_app.User.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    List <User> findAllByStatus (Status status);

    User findAllByUsername (String username);

}

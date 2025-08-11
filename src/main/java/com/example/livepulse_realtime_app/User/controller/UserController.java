package com.example.livepulse_realtime_app.User.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.livepulse_realtime_app.User.entity.User;
import com.example.livepulse_realtime_app.User.service.UserService;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @MessageMapping ("/user.addUser")
    @SendTo("/user/public")
    public User addUser (@Payload User user) {
        User existingUser = userService.findByUsername(user.getUsername());

        if (existingUser == null) {
            userService.saveUser(user);
        }

        return user;

    }

    @MessageMapping ("/user.disconnectUser")
    @SendTo("/user/public")
    public User disconnectUser (@Payload User user) {
        userService.disconnect(user);
        return user;
    }

    @GetMapping ("/users")
    public ResponseEntity<List<User>> findConnectedUsers () {
        return ResponseEntity.ok(userService.findAllByStatus());
    }


    @GetMapping ("/current-user")
    public ResponseEntity<User> getCurrentUser () {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ResponseEntity.ok(userService.findByUsername(username));
    }







}

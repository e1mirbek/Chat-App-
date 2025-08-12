package com.example.livepulse_realtime_app.User.service.implementation;


import com.example.livepulse_realtime_app.User.entity.Status;
import com.example.livepulse_realtime_app.User.entity.User;
import com.example.livepulse_realtime_app.User.repository.UserRepository;
import com.example.livepulse_realtime_app.User.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findAllByUsername(username);
        if (user == null) {
            throw  new UsernameNotFoundException(username);
        }
        return user;
    }

    @Autowired
    private UserRepository userRepository;

    @Override
    public void saveUser(User user) {

        user.setStatus(Status.ONLINE);
        userRepository.save(user);

    }

    @Override
    public void disconnect(User user) {

        var storedUser = userRepository.findAllByUsername(user.getUsername());

        if (storedUser != null && storedUser.getStatus() != Status.ONLINE) {

            storedUser.setStatus(Status.OFFLINE);

            userRepository.save(storedUser);

        }
    }

    @Override
    public List<User> findAllByStatus() {
        return userRepository.findAllByStatus(Status.ONLINE);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findAllByUsername(username);
    }
}

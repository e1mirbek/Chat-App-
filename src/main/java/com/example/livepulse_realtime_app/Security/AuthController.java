package com.example.livepulse_realtime_app.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.livepulse_realtime_app.User.entity.Status;
import com.example.livepulse_realtime_app.User.entity.User;
import com.example.livepulse_realtime_app.User.service.UserService;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Главная страница (после входа)
    @GetMapping("/")
    public String index() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            user.setStatus(Status.ONLINE);
            userService.saveUser(user);
        }

        return "index";
    }

    // Страница входа
    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }

    // Показать страницу регистрации
    @GetMapping("/register")
    public String showRegisterPage(Model model) {
        model.addAttribute("user", new User());
        return "auth/register";
    }

    // Обработка регистрации
    @PostMapping("/register")
    public String processRegister(@ModelAttribute("user") User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setStatus(Status.OFFLINE); // при регистрации ставим OFFLINE
        userService.saveUser(user);
        return "redirectaq              aaqwsqaw1a11й:/login";
    }

    // Выход (можно добавить логику смены статуса)
    @GetMapping("/logout-success")
    public String logoutSuccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            user.setStatus(Status.OFFLINE);
            userService.saveUser(user);
        }

        return "redirect:/login?logout";
    }
}

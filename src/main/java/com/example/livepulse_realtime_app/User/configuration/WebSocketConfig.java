 package com.example.livepulse_realtime_app.User.configuration;


import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.DefaultContentTypeResolver;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Настройка брокера сообщений (message broker).
     *
     * enableSimpleBroker("/user") — включает встроенный брокер для обработки сообщений,
     * отправляемых клиенту. Префикс "/user" означает, что сообщения клиенту будут направляться по этому пути.
     *
     * setApplicationDestinationPrefixes("/app") — указывает префикс для сообщений,
     * которые будут направляться от клиента на сервер. Все входящие сообщения должны начинаться с "/app".
     *
     * setUserDestinationPrefix("/user") — используется для отправки сообщений конкретному пользователю.
     */

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/user");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }


    /**
     * Регистрирует WebSocket endpoint, через который клиент будет подключаться к серверу.
     *
     * addEndpoint("/ws") — клиент подключается по этому пути, например ws://localhost:8080/ws.
     *
     * withSockJS() — добавляет поддержку SockJS (на случай, если WebSocket не поддерживается браузером).
     */

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/websocket").withSockJS();
    }

    /**
     * Настраивает преобразователь сообщений (MessageConverter), который отвечает за сериализацию/десериализацию данных.
     *
     * В данном случае используется Jackson (ObjectMapper) для преобразования JSON-сообщений.
     *
     * - DefaultContentTypeResolver — устанавливает, что тип содержимого по умолчанию — JSON.
     * - MappingJackson2MessageConverter — сам конвертер, использующий Jackson для преобразования объектов.
     *
     * messageConverters.add(converter) — добавляем наш конвертер в список доступных.
     *
     * Возвращаем false, чтобы оставить и стандартные конвертеры Spring.
     */

    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper((new ObjectMapper()));
        converter.setContentTypeResolver(resolver);
        messageConverters.add(converter);
        return false;
    }
}

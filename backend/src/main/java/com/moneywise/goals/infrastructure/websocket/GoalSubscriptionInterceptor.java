package com.moneywise.goals.infrastructure.websocket;

import java.security.Principal;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import com.moneywise.goals.application.usecase.subscription.AuthorizeGoalSubscription;


@Component
public class GoalSubscriptionInterceptor implements ChannelInterceptor {

    private static final Pattern GOAL_TOPIC = Pattern.compile("^/topic/goals/([0-9a-fA-F-]{36})$");

    private final AuthorizeGoalSubscription authorizeGoalSubscription;

    public GoalSubscriptionInterceptor(AuthorizeGoalSubscription authorizeGoalSubscription) {
        this.authorizeGoalSubscription = authorizeGoalSubscription;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }
        if (accessor.getCommand() == StompCommand.SUBSCRIBE) {
            checkSubscription(accessor);
        } else if (accessor.getCommand() == StompCommand.SEND) {
            throw new AccessDeniedException("O cliente não pode publicar mensagens.");
        }
        return message;
    }

    private void checkSubscription(StompHeaderAccessor accessor) {
        UUID userId = userIdOf(accessor.getUser());

        Matcher matcher = GOAL_TOPIC.matcher(String.valueOf(accessor.getDestination()));
        if (!matcher.matches()) {
            throw new AccessDeniedException("Destino de inscrição inválido.");
        }
        UUID goalId = parseUuid(matcher.group(1));

        if (!authorizeGoalSubscription.canSubscribe(goalId, userId)) {
            throw new AccessDeniedException("Inscrição recusada.");
        }
    }

    private UUID userIdOf(Principal user) {
        if (user == null) {
            throw new AccessDeniedException("Conexão sem usuário autenticado.");
        }
        return parseUuid(user.getName());
    }

    private UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Identificador inválido.");
        }
    }
}

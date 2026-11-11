package com.moneywise.goals.presentation.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.moneywise.goals.presentation.dto.ThermometerResponseDTO;


@Component
public class GoalWebSocketPublisher {

    private static final Logger log = LoggerFactory.getLogger(GoalWebSocketPublisher.class);

    private final SimpMessagingTemplate messagingTemplate;

    public GoalWebSocketPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(ThermometerResponseDTO thermometer) {
        try {
            messagingTemplate.convertAndSend("/topic/goals/" + thermometer.goalId(), thermometer);
        } catch (RuntimeException e) {
            log.warn("Falha ao publicar o Termômetro da meta {}", thermometer.goalId(), e);
        }
    }
}
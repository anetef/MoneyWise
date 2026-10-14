package com.moneywise.auth.infrastructure.mail;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "moneywise.mail")
public record MailProperties(String provider, String from, String resendApiKey) {
}

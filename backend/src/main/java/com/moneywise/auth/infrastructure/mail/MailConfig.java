package com.moneywise.auth.infrastructure.mail;

import com.moneywise.auth.application.port.EmailSender;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MailProperties.class)
public class MailConfig {

    @Bean
    @ConditionalOnProperty(name = "moneywise.mail.provider", havingValue = "resend")
    EmailSender resendEmailSender(MailProperties properties) {
        return new ResendEmailSender(properties);
    }

    @Bean
    @ConditionalOnProperty(name = "moneywise.mail.provider", havingValue = "log", matchIfMissing = true)
    EmailSender loggingEmailSender() {
        return new LoggingEmailSender();
    }
}

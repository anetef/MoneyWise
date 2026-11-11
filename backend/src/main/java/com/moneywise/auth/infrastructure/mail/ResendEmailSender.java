package com.moneywise.auth.infrastructure.mail;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.HtmlUtils;

import com.moneywise.auth.application.port.EmailSender;

public class ResendEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailSender.class);
    private static final String RESEND_BASE_URL = "https://api.resend.com";

    private final RestClient restClient;
    private final String from;

    public ResendEmailSender(MailProperties properties) {
        if (properties.resendApiKey() == null || properties.resendApiKey().isBlank()) {
            throw new IllegalStateException(
                    "moneywise.mail.provider=resend, mas RESEND_API_KEY não foi definida.");
        }
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder()
                .baseUrl(RESEND_BASE_URL)
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + properties.resendApiKey())
                .build();
        this.from = properties.from();
    }

    @Override
    public void sendVerificationCode(String to, String userName, String code, Duration expiresIn) {
        long minutes = expiresIn.toMinutes();
        String safeName = HtmlUtils.htmlEscape(userName);
        String text = "Olá, " + userName + "!\n\n"
                + "Seu código de confirmação do MoneyWise é: " + code + "\n"
                + "Ele expira em " + minutes + " minutos.\n\n"
                + "Se você não criou uma conta, ignore este e-mail.";
        String html = "<p>Olá, " + safeName + "!</p>"
                + "<p>Seu código de confirmação do MoneyWise é:</p>"
                + codeHtml(code)
                + "<p>Ele expira em " + minutes + " minutos.</p>"
                + "<p>Se você não criou uma conta, ignore este e-mail.</p>";
        send(to, "Seu código de confirmação do MoneyWise", text, html, "verificação");
    }

    @Override
    public void sendPasswordResetCode(String to, String userName, String code, Duration expiresIn) {
        long minutes = expiresIn.toMinutes();
        String safeName = HtmlUtils.htmlEscape(userName);
        String text = "Olá, " + userName + "!\n\n"
                + "Seu código para cadastrar uma nova senha no MoneyWise é: " + code + "\n"
                + "Ele expira em " + minutes + " minutos.\n\n"
                + "Se você não pediu para trocar a senha, ignore este e-mail. Sua senha continua a mesma.";
        String html = "<p>Olá, " + safeName + "!</p>"
                + "<p>Seu código para cadastrar uma nova senha no MoneyWise é:</p>"
                + codeHtml(code)
                + "<p>Ele expira em " + minutes + " minutos.</p>"
                + "<p>Se você não pediu para trocar a senha, ignore este e-mail. Sua senha continua a mesma.</p>";
        send(to, "Código para redefinir sua senha do MoneyWise", text, html, "recuperação de senha");
    }

    private static String codeHtml(String code) {
        return "<p style=\"font-size:24px;font-weight:bold;letter-spacing:4px\">" + code + "</p>";
    }

    /** Chamada ao Resend. Uma falha só vai para o log: quem chamou não recebe erro. */
    private void send(String to, String subject, String text, String html, String kind) {
        Map<String, Object> body = Map.of(
                "from", from,
                "to", List.of(to),
                "subject", subject,
                "text", text,
                "html", html);
        try {
            restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.error("Falha ao enviar e-mail de {} pelo Resend: {}", kind, e.getMessage());
        }
    }
}
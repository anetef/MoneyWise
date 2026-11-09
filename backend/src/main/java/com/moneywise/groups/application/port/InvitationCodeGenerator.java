package com.moneywise.groups.application.port;

/** Gera o código que o app compartilha como link, WhatsApp ou QR Code (L-05). */
public interface InvitationCodeGenerator {

    String generate();
}

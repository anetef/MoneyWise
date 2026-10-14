package com.moneywise.shared.web;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import io.swagger.v3.oas.annotations.Parameter;

/**
 * Injeta no parâmetro do controller o id do usuário autenticado, lido do access token.
 * É a única forma de um controller saber quem é o usuário: nunca pelo corpo nem pela URL.
 *
 * Uso: public ... metodo(@CurrentUserId UUID userId)
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Parameter(hidden = true)
public @interface CurrentUserId {
}
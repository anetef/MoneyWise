package com.moneywise.shared.exception;

public class TooManyRequestsException extends DomainException {

    public static final String DEFAULT_CODE = "TOO_MANY_REQUESTS";

    public TooManyRequestsException(String message) {
        super(DEFAULT_CODE, message);
    }

    public TooManyRequestsException(String code, String message) {
        super(code, message);
    }
}

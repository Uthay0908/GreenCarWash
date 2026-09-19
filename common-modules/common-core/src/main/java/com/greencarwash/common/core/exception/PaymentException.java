package com.greencarwash.common.core.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class PaymentException extends BaseException {
    public PaymentException(String message) {
        super(message, HttpStatus.PAYMENT_REQUIRED, "PAYMENT_FAILED");
    }

    public PaymentException(String message, String errorCode, Map<String, Object> details) {
        super(message, HttpStatus.PAYMENT_REQUIRED, errorCode, details);
    }
}

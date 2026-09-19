package com.greencarwash.common.core.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class ValidationException extends BaseException {
    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_FAILED");
    }

    public ValidationException(String message, Map<String, Object> details) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", details);
    }
}

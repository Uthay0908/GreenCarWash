package com.greencarwash.common.core.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class BusinessException extends BaseException {

    public BusinessException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "BUSINESS_RULE_VIOLATION");
    }

    public BusinessException(String message, String errorCode) {
        super(message, HttpStatus.BAD_REQUEST, errorCode);
    }

    public BusinessException(String message, String errorCode, Map<String, Object> details) {
        super(message, HttpStatus.BAD_REQUEST, errorCode, details);
    }
}

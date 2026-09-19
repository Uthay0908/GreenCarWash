package com.greencarwash.common.core.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class ExternalServiceException extends BaseException {
    public ExternalServiceException(String message) {
        super(message, HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR");
    }

    public ExternalServiceException(String message, String serviceName, Map<String, Object> details) {
        super(message, HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR_" + serviceName.toUpperCase(), details);
    }
}

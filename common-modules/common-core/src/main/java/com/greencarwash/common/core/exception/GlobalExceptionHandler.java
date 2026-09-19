package com.greencarwash.common.core.exception;

import com.greencarwash.common.core.dto.ErrorResponse;
import com.greencarwash.common.core.util.CorrelationContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        log.warn("Application exception: [{}] {} - path: {}", ex.getErrorCode(), ex.getMessage(), request.getRequestURI());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(ex.getHttpStatus().value())
                .error(ex.getHttpStatus().getReasonPhrase())
                .code(ex.getErrorCode())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .correlationId(CorrelationContext.getCorrelationId())
                .details(ex.getDetails())
                .build();
        return ResponseEntity.status(ex.getHttpStatus()).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, Object> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        log.warn("Validation failed for {}: {}", request.getRequestURI(), fieldErrors);
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .code("VALIDATION_FAILED")
                .message("Input validation failed")
                .path(request.getRequestURI())
                .correlationId(CorrelationContext.getCorrelationId())
                .details(fieldErrors)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, Object> details = new HashMap<>();
        ex.getConstraintViolations().forEach(cv -> details.put(cv.getPropertyPath().toString(), cv.getMessage()));

        log.warn("Constraint violation for {}: {}", request.getRequestURI(), details);
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .code("CONSTRAINT_VIOLATION")
                .message("Constraint violation occurred")
                .path(request.getRequestURI())
                .correlationId(CorrelationContext.getCorrelationId())
                .details(details)
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        log.warn("Response status exception: {} - path: {}", ex.getReason(), request.getRequestURI());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(ex.getStatusCode().value())
                .error(HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase())
                .code("REQUEST_FAILED")
                .message(ex.getReason() != null ? ex.getReason() : ex.getMessage())
                .path(request.getRequestURI())
                .correlationId(CorrelationContext.getCorrelationId())
                .build();
        return ResponseEntity.status(ex.getStatusCode()).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception for request: {} [correlationId={}]", request.getRequestURI(), CorrelationContext.getCorrelationId(), ex);
        String debugMessage = ex.getClass().getSimpleName() + ": " + ex.getMessage();
        if (ex.getCause() != null) {
            debugMessage += " | Caused by: " + ex.getCause().getClass().getSimpleName() + ": " + ex.getCause().getMessage();
        }
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .code("INTERNAL_SERVER_ERROR")
                .message(debugMessage)
                .path(request.getRequestURI())
                .correlationId(CorrelationContext.getCorrelationId())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

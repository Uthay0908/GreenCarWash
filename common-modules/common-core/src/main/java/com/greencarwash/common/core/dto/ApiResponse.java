package com.greencarwash.common.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.greencarwash.common.core.util.CorrelationContext;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private Instant timestamp = Instant.now();

    private int status;

    private boolean success;

    private String message;

    private T data;

    private String correlationId;

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Success", CorrelationContext.getCorrelationId());
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return success(data, message, CorrelationContext.getCorrelationId());
    }

    public static <T> ApiResponse<T> success(T data, String message, String correlationId) {
        return ApiResponse.<T>builder()
                .timestamp(Instant.now())
                .status(200)
                .success(true)
                .message(message)
                .data(data)
                .correlationId(correlationId)
                .build();
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return created(data, message, CorrelationContext.getCorrelationId());
    }

    public static <T> ApiResponse<T> created(T data, String message, String correlationId) {
        return ApiResponse.<T>builder()
                .timestamp(Instant.now())
                .status(201)
                .success(true)
                .message(message)
                .data(data)
                .correlationId(correlationId)
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message, String correlationId) {
        return ApiResponse.<T>builder()
                .timestamp(Instant.now())
                .status(status)
                .success(false)
                .message(message)
                .correlationId(correlationId)
                .build();
    }
}

package com.greencarwash.common.core.util;

import org.slf4j.MDC;

public final class CorrelationContext {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    public static final String MDC_KEY = "correlationId";

    private static final ThreadLocal<String> CURRENT_CORRELATION_ID = new ThreadLocal<>();

    private CorrelationContext() {}

    public static void setCorrelationId(String correlationId) {
        CURRENT_CORRELATION_ID.set(correlationId);
        if (correlationId != null) {
            MDC.put(MDC_KEY, correlationId);
        } else {
            MDC.remove(MDC_KEY);
        }
    }

    public static String getCorrelationId() {
        return CURRENT_CORRELATION_ID.get();
    }

    public static void clear() {
        CURRENT_CORRELATION_ID.remove();
        MDC.remove(MDC_KEY);
    }
}

package com.greencarwash.common.security.util;

import com.greencarwash.common.core.exception.UnauthorizedException;
import com.greencarwash.common.security.model.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.Set;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static String getRequiredCurrentUserId() {
        return getCurrentUser()
                .map(UserPrincipal::getUserId)
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static String getRequiredCurrentUserEmail() {
        return getCurrentUser()
                .map(UserPrincipal::getEmail)
                .orElseThrow(() -> new UnauthorizedException("User is not authenticated"));
    }

    public static boolean hasRole(String role) {
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getCurrentUser()
                .map(UserPrincipal::getRoles)
                .filter(roles -> roles.contains(role) || roles.contains(roleWithPrefix))
                .isPresent();
    }

    public static boolean isAdmin() {
        return hasRole("ROLE_ADMIN") || hasRole("ROLE_SUPER_ADMIN");
    }

    public static boolean isWasher() {
        return hasRole("ROLE_WASHER");
    }

    public static boolean isCustomer() {
        return hasRole("ROLE_CUSTOMER");
    }
}

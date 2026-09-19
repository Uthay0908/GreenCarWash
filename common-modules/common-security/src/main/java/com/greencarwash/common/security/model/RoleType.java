package com.greencarwash.common.security.model;

public enum RoleType {
    ROLE_CUSTOMER,
    ROLE_WASHER,
    ROLE_ADMIN,
    ROLE_SUPER_ADMIN,
    ROLE_BRANCH_MANAGER,
    ROLE_SUPPORT_AGENT,
    ROLE_CORPORATE_ADMIN,
    ROLE_CORPORATE_EMPLOYEE;

    public String getAuthority() {
        return name();
    }
}

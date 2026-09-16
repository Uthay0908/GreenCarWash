# GreenCarWash - 17 Microservices

GreenCarWash is a Spring Boot 3.5.4 and Java 21 microservices platform containing exactly 17 deployment boundaries.

## Services

1. config-server
2. discovery-server
3. api-gateway
4. auth-service
5. user-service
6. vehicle-service
7. catalog-service
8. booking-service
9. washer-service
10. assignment-service
11. payment-service
12. invoice-service
13. notification-service
14. review-service
15. loyalty-service
16. reporting-service
17. support-service

## Technology

- Java 21
- Spring Boot 3.5.4
- Spring Cloud 2025.0.0
- Maven multi-module build
- MySQL
- RabbitMQ
- Eureka Service Discovery
- Spring Cloud Gateway
- Spring Cloud Config Server
- Spring Security and JWT
- Swagger/OpenAPI
- Resilience4j
- JUnit 5 and Mockito in all 17 modules
- HTML, CSS and JavaScript frontend

## STS Import

1. Extract the ZIP.
2. Open STS and select File > Import > Maven > Existing Maven Projects.
3. Select the extracted GreenCarWash folder.
4. Select all 17 Maven modules.
5. Finish the import.
6. Right-click the root project and select Maven > Update Project.
7. Enable Force Update of Snapshots/Releases.
8. Confirm every service uses JRE System Library [JavaSE-21].
9. Select Project > Clean and clean all GreenCarWash projects.
10. Run Maven tests/build from the root.

## Ports

- config-server: 8888
- discovery-server: 8761
- api-gateway: 8080
- auth-service: 8081
- user-service: 8082
- vehicle-service: 8083
- catalog-service: 8084
- booking-service: 8085
- washer-service: 8086
- assignment-service: 8087
- payment-service: 8088
- invoice-service: 8089
- notification-service: 8090
- review-service: 8091
- loyalty-service: 8092
- reporting-service: 8093
- support-service: 8094

## Run Order

1. config-server
2. discovery-server
3. api-gateway
4. auth-service
5. user-service
6. vehicle-service
7. catalog-service
8. booking-service
9. washer-service
10. assignment-service
11. payment-service
12. invoice-service
13. notification-service
14. review-service
15. loyalty-service
16. reporting-service
17. support-service

## Infrastructure

The included docker-compose.yml starts MySQL and RabbitMQ. Service database, RabbitMQ and Eureka settings use environment-variable overrides.

## Frontend

The frontend uses only HTML, CSS and JavaScript.

## Postman

The postman folder contains the GreenCarWash collection and environment.

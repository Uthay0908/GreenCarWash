package com.greencarwash.assignment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.greencarwash.assignment", "com.greencarwash.common"})
public class WasherAssignmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(WasherAssignmentApplication.class, args);
    }
}

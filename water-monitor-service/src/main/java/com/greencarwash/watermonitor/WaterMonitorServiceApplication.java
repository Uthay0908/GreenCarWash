package com.greencarwash.watermonitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.greencarwash.watermonitor", "com.greencarwash.common"})
public class WaterMonitorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WaterMonitorServiceApplication.class, args);
    }
}

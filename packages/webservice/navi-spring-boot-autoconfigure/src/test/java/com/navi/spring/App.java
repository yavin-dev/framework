package com.navi.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

/**
 * Example app using elide-spring.
 */
@SpringBootApplication
@EntityScan( basePackages = {"com.yahoo.navi.ws.models"} )
public class App {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(App.class, args);
    }
}
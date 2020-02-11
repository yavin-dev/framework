package com.yahoo.navi.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

import java.util.Arrays;
import java.util.Collections;

/**
 * Example app using elide-spring.
 */
@SpringBootApplication
public class App {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(App.class, args);
    }

    @Bean
    @Primary
    public UserDetailsService userDetailsService() {
        User basicUser = new User("navi-user", "password", Collections.emptyList());

        return new InMemoryUserDetailsManager(Arrays.asList(basicUser));
    }
}
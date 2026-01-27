package com.slidr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SlidrApplication {
    public static void main(String[] args) {
        SpringApplication.run(SlidrApplication.class, args);
        System.out.println("--- SLIDR BACKEND DEMARRÉ SUR LE PORT 8080 ---");
    }
}
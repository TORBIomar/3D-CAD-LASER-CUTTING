package com.zahirimetal.cad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ZahiriMetalCadBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZahiriMetalCadBackendApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("⚡ ZAHIRI METAL TUBE FIBER LASER CAD BACKEND SERVER IS RUNNING ⚡");
        System.out.println("➜ REST API Base URL: http://localhost:8080/api/v1/projects");
        System.out.println("==================================================================");
    }
}

package com.taskmanager.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ))
                .info(new Info()
                        .title("Task Manager REST API")
                        .version("1.0.0")
                        .description("Production-ready CRUD REST API for task management built with Java 21, Spring Boot 3, Spring MVC, Spring Data JPA, and MySQL. Features dynamic filtering, pagination, sorting, metrics dashboard, and modern responsive UI.")
                        .contact(new Contact()
                                .name("Engineering Team")
                                .email("dev@taskmanager.local"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}

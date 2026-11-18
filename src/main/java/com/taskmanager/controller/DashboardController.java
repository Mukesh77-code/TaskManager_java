package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.DashboardStatsDto;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "System health and aggregate metrics")
public class DashboardController {

    private final TaskService taskService;

    public DashboardController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get overview metrics for dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        DashboardStatsDto stats = taskService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard metrics loaded", stats));
    }

    @GetMapping("/health")
    @Operation(summary = "System health check")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Task Manager REST API");
        health.put("version", "1.0.0");
        health.put("serverTime", LocalDateTime.now());
        health.put("database", "Connected");
        return ResponseEntity.ok(ApiResponse.ok("System healthy", health));
    }
}

package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.DashboardStatsDto;
import com.taskmanager.dto.PageResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.TaskStatusUpdateDto;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@Tag(name = "Tasks", description = "CRUD operations, dynamic filtering, status updates, and stats for tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    @Operation(summary = "Get paginated tasks with search & filter options",
               description = "Filter tasks by status, priority, category, overdue, or search keyword in title/description.")
    public ResponseEntity<ApiResponse<PageResponse<TaskResponse>>> getTasks(
            @Parameter(description = "Filter by status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED")
            @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Filter by priority: LOW, MEDIUM, HIGH, URGENT")
            @RequestParam(required = false) Priority priority,
            @Parameter(description = "Filter by category ID")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Search term for title or description")
            @RequestParam(required = false) String search,
            @Parameter(description = "Only return overdue tasks")
            @RequestParam(required = false) Boolean overdueOnly,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort property (createdAt, dueDate, priority, title, status)")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc, desc)")
            @RequestParam(defaultValue = "desc") String sortDir) {

        PageResponse<TaskResponse> tasks = taskService.getTasks(
                status, priority, categoryId, search, overdueOnly, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.ok("Tasks retrieved successfully", tasks));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single task by ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        TaskResponse task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.ok("Task retrieved successfully", task));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse createdTask = taskService.createTask(request);
        return new ResponseEntity<>(
                ApiResponse.ok("Task created successfully", createdTask),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing task")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse updatedTask = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully", updatedTask));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Quick update task status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateDto statusUpdateDto) {
        TaskResponse updatedTask = taskService.updateTaskStatus(id, statusUpdateDto.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Task status updated to " + statusUpdateDto.getStatus(), updatedTask));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task by ID")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.ok("Task deleted successfully with ID: " + id, null));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get task summary statistics",
               description = "Returns counts by status, priority, overdue count, and completion rate.")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getTaskStats() {
        DashboardStatsDto stats = taskService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics retrieved successfully", stats));
    }
}

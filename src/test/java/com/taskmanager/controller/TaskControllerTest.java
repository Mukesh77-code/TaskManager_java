package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.dto.CategoryDto;
import com.taskmanager.dto.PageResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.TaskStatusUpdateDto;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    private TaskResponse sampleResponse;

    @BeforeEach
    void setUp() {
        CategoryDto catDto = new CategoryDto(1L, "Backend", "#3B82F6", "Backend tasks", LocalDateTime.now(), 1);
        sampleResponse = new TaskResponse(
                1L,
                "Build REST Endpoints",
                "Create controller methods",
                TaskStatus.IN_PROGRESS,
                Priority.HIGH,
                LocalDate.now().plusDays(2),
                catDto,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    void testGetTasks_ReturnsPageResponse() throws Exception {
        PageResponse<TaskResponse> page = new PageResponse<>(List.of(sampleResponse), 0, 10, 1, 1, true, true);
        when(taskService.getTasks(any(), any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(page);

        mockMvc.perform(get("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].title").value("Build REST Endpoints"));
    }

    @Test
    void testGetTaskById_Success() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void testGetTaskById_NotFound_Returns404() throws Exception {
        when(taskService.getTaskById(999L))
                .thenThrow(new ResourceNotFoundException("Task", "id", 999L));

        mockMvc.perform(get("/api/v1/tasks/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void testCreateTask_Success_Returns201() throws Exception {
        TaskRequest request = new TaskRequest("Build REST Endpoints", "Create controller methods",
                TaskStatus.IN_PROGRESS, Priority.HIGH, LocalDate.now().plusDays(2), 1L);

        when(taskService.createTask(any(TaskRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Build REST Endpoints"));
    }

    @Test
    void testCreateTask_ValidationError_Returns400() throws Exception {
        // Title is blank -> should trigger Bean Validation failure
        TaskRequest invalidRequest = new TaskRequest("", "Desc without title",
                TaskStatus.PENDING, Priority.LOW, null, null);

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.validationErrors.title").exists());
    }

    @Test
    void testUpdateTaskStatus_Success() throws Exception {
        sampleResponse.setStatus(TaskStatus.COMPLETED);
        when(taskService.updateTaskStatus(eq(1L), eq(TaskStatus.COMPLETED))).thenReturn(sampleResponse);

        TaskStatusUpdateDto updateDto = new TaskStatusUpdateDto(TaskStatus.COMPLETED);

        mockMvc.perform(patch("/api/v1/tasks/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    void testDeleteTask_Success() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/v1/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

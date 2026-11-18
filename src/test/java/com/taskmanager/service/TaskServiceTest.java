package com.taskmanager.service;

import com.taskmanager.dto.CategoryDto;
import com.taskmanager.dto.DashboardStatsDto;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Category;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.CategoryRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskServiceImpl taskService;

    private Task sampleTask;
    private TaskResponse sampleResponse;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category(1L, "Backend", "#3B82F6", "Backend tasks");
        sampleTask = new Task("Test Task", "Description", TaskStatus.PENDING, Priority.HIGH, LocalDate.now().plusDays(2), sampleCategory);
        sampleTask.setId(10L);

        CategoryDto catDto = new CategoryDto(1L, "Backend", "#3B82F6", "Backend tasks", LocalDateTime.now(), 1);
        sampleResponse = new TaskResponse(10L, "Test Task", "Description", TaskStatus.PENDING, Priority.HIGH, LocalDate.now().plusDays(2), catDto, LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void testGetTaskById_Success() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(sampleTask));
        when(taskMapper.toTaskResponse(sampleTask)).thenReturn(sampleResponse);

        TaskResponse result = taskService.getTaskById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("Test Task", result.getTitle());
        verify(taskRepository, times(1)).findById(10L);
    }

    @Test
    void testGetTaskById_NotFound() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(999L));
        verify(taskRepository, times(1)).findById(999L);
    }

    @Test
    void testCreateTask() {
        TaskRequest request = new TaskRequest("New Task", "Desc", TaskStatus.PENDING, Priority.MEDIUM, LocalDate.now().plusDays(3), 1L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(taskMapper.toTaskEntity(eq(request), eq(sampleCategory))).thenReturn(sampleTask);
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);
        when(taskMapper.toTaskResponse(sampleTask)).thenReturn(sampleResponse);

        TaskResponse result = taskService.createTask(request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void testUpdateTaskStatus() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(sampleTask)).thenReturn(sampleTask);

        sampleResponse.setStatus(TaskStatus.COMPLETED);
        when(taskMapper.toTaskResponse(sampleTask)).thenReturn(sampleResponse);

        TaskResponse result = taskService.updateTaskStatus(10L, TaskStatus.COMPLETED);

        assertNotNull(result);
        assertEquals(TaskStatus.COMPLETED, result.getStatus());
        verify(taskRepository, times(1)).save(sampleTask);
    }

    @Test
    void testDeleteTask() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).delete(sampleTask);

        taskService.deleteTask(10L);

        verify(taskRepository, times(1)).delete(sampleTask);
    }

    @Test
    void testGetDashboardStats() {
        when(taskRepository.count()).thenReturn(10L);
        when(taskRepository.countByStatus(TaskStatus.PENDING)).thenReturn(4L);
        when(taskRepository.countByStatus(TaskStatus.IN_PROGRESS)).thenReturn(3L);
        when(taskRepository.countByStatus(TaskStatus.COMPLETED)).thenReturn(3L);
        when(taskRepository.countByStatus(TaskStatus.CANCELLED)).thenReturn(0L);
        when(taskRepository.countOverdueTasks(any(LocalDate.class))).thenReturn(1L);

        DashboardStatsDto stats = taskService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalTasks());
        assertEquals(3L, stats.getCompletedTasks());
        assertEquals(30.0, stats.getCompletionRate());
        assertEquals(1L, stats.getOverdueTasks());
    }
}

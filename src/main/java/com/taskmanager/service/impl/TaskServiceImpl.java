package com.taskmanager.service.impl;

import com.taskmanager.dto.DashboardStatsDto;
import com.taskmanager.dto.PageResponse;
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
import com.taskmanager.service.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskRepository taskRepository,
                           CategoryRepository categoryRepository,
                           TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.categoryRepository = categoryRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> getTasks(TaskStatus status,
                                               Priority priority,
                                               Long categoryId,
                                               String search,
                                               Boolean overdueOnly,
                                               int page,
                                               int size,
                                               String sortBy,
                                               String sortDir) {
        // Normalize sort parameters
        String validSortBy = "createdAt";
        if (sortBy != null && !sortBy.isBlank()) {
            switch (sortBy.toLowerCase()) {
                case "id" -> validSortBy = "id";
                case "title" -> validSortBy = "title";
                case "duedate", "due_date" -> validSortBy = "dueDate";
                case "priority" -> validSortBy = "priority";
                case "status" -> validSortBy = "status";
                case "updatedat", "updated_at" -> validSortBy = "updatedAt";
                default -> validSortBy = "createdAt";
            }
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, validSortBy));

        String sanitizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<Task> taskPage = taskRepository.findTasksWithFilters(
                status,
                priority,
                categoryId,
                sanitizedSearch,
                overdueOnly,
                LocalDate.now(),
                pageable
        );

        Page<TaskResponse> responsePage = taskPage.map(taskMapper::toTaskResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        return taskMapper.toTaskResponse(task);
    }

    @Override
    public TaskResponse createTask(TaskRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        Task task = taskMapper.toTaskEntity(request, category);
        Task savedTask = taskRepository.save(task);
        return taskMapper.toTaskResponse(savedTask);
    }

    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        taskMapper.updateTaskFromRequest(task, request, category);
        Task updatedTask = taskRepository.save(task);
        return taskMapper.toTaskResponse(updatedTask);
    }

    @Override
    public TaskResponse updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return taskMapper.toTaskResponse(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalTasks = taskRepository.count();
        long pending = taskRepository.countByStatus(TaskStatus.PENDING);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long completed = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long cancelled = taskRepository.countByStatus(TaskStatus.CANCELLED);
        long overdue = taskRepository.countOverdueTasks(LocalDate.now());

        double completionRate = totalTasks > 0
                ? Math.round(((double) completed / totalTasks * 100.0) * 10.0) / 10.0
                : 0.0;

        Map<String, Long> statusMap = new HashMap<>();
        statusMap.put("PENDING", pending);
        statusMap.put("IN_PROGRESS", inProgress);
        statusMap.put("COMPLETED", completed);
        statusMap.put("CANCELLED", cancelled);

        Map<String, Long> priorityMap = new HashMap<>();
        for (Priority p : Priority.values()) {
            priorityMap.put(p.name(), taskRepository.countByPriority(p));
        }

        return new DashboardStatsDto(
                totalTasks,
                pending,
                inProgress,
                completed,
                cancelled,
                overdue,
                completionRate,
                priorityMap,
                statusMap
        );
    }
}

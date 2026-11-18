package com.taskmanager.service;

import com.taskmanager.dto.DashboardStatsDto;
import com.taskmanager.dto.PageResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.TaskStatus;

public interface TaskService {

    PageResponse<TaskResponse> getTasks(TaskStatus status,
                                        Priority priority,
                                        Long categoryId,
                                        String search,
                                        Boolean overdueOnly,
                                        int page,
                                        int size,
                                        String sortBy,
                                        String sortDir);

    TaskResponse getTaskById(Long id);

    TaskResponse createTask(TaskRequest request);

    TaskResponse updateTask(Long id, TaskRequest request);

    TaskResponse updateTaskStatus(Long id, TaskStatus status);

    void deleteTask(Long id);

    DashboardStatsDto getDashboardStats();
}

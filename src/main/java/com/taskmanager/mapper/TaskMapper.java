package com.taskmanager.mapper;

import com.taskmanager.dto.CategoryDto;
import com.taskmanager.dto.CategoryRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Category;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public CategoryDto toCategoryDto(Category category, long taskCount) {
        if (category == null) {
            return null;
        }
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getColor(),
                category.getDescription(),
                category.getCreatedAt(),
                taskCount
        );
    }

    public Category toCategoryEntity(CategoryRequest request) {
        if (request == null) {
            return null;
        }
        return new Category(
                request.getName().trim(),
                request.getColor() != null && !request.getColor().isBlank() ? request.getColor().trim() : "#3B82F6",
                request.getDescription() != null ? request.getDescription().trim() : null
        );
    }

    public TaskResponse toTaskResponse(Task task) {
        if (task == null) {
            return null;
        }

        CategoryDto categoryDto = null;
        if (task.getCategory() != null) {
            categoryDto = new CategoryDto(
                    task.getCategory().getId(),
                    task.getCategory().getName(),
                    task.getCategory().getColor(),
                    task.getCategory().getDescription(),
                    task.getCategory().getCreatedAt(),
                    0
            );
        }

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                categoryDto,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    public Task toTaskEntity(TaskRequest request, Category category) {
        if (request == null) {
            return null;
        }

        Task task = new Task();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING);
        task.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        task.setDueDate(request.getDueDate());
        task.setCategory(category);
        return task;
    }

    public void updateTaskFromRequest(Task task, TaskRequest request, Category category) {
        if (task == null || request == null) {
            return;
        }
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setDueDate(request.getDueDate());
        task.setCategory(category);
    }
}

package com.taskmanager.dto;

import com.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class TaskStatusUpdateDto {

    @NotNull(message = "Task status cannot be null")
    private TaskStatus status;

    public TaskStatusUpdateDto() {
    }

    public TaskStatusUpdateDto(TaskStatus status) {
        this.status = status;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}

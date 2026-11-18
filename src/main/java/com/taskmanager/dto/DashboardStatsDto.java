package com.taskmanager.dto;

import java.util.Map;

public class DashboardStatsDto {

    private long totalTasks;
    private long pendingTasks;
    private long inProgressTasks;
    private long completedTasks;
    private long cancelledTasks;
    private long overdueTasks;
    private double completionRate;
    private Map<String, Long> tasksByPriority;
    private Map<String, Long> tasksByStatus;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalTasks, long pendingTasks, long inProgressTasks,
                             long completedTasks, long cancelledTasks, long overdueTasks,
                             double completionRate, Map<String, Long> tasksByPriority,
                             Map<String, Long> tasksByStatus) {
        this.totalTasks = totalTasks;
        this.pendingTasks = pendingTasks;
        this.inProgressTasks = inProgressTasks;
        this.completedTasks = completedTasks;
        this.cancelledTasks = cancelledTasks;
        this.overdueTasks = overdueTasks;
        this.completionRate = completionRate;
        this.tasksByPriority = tasksByPriority;
        this.tasksByStatus = tasksByStatus;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public void setInProgressTasks(long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getCancelledTasks() {
        return cancelledTasks;
    }

    public void setCancelledTasks(long cancelledTasks) {
        this.cancelledTasks = cancelledTasks;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public void setOverdueTasks(long overdueTasks) {
        this.overdueTasks = overdueTasks;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public Map<String, Long> getTasksByPriority() {
        return tasksByPriority;
    }

    public void setTasksByPriority(Map<String, Long> tasksByPriority) {
        this.tasksByPriority = tasksByPriority;
    }

    public Map<String, Long> getTasksByStatus() {
        return tasksByStatus;
    }

    public void setTasksByStatus(Map<String, Long> tasksByStatus) {
        this.tasksByStatus = tasksByStatus;
    }
}

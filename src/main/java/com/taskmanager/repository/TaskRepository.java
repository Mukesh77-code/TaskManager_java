package com.taskmanager.repository;

import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:categoryId IS NULL OR (t.category IS NOT NULL AND t.category.id = :categoryId)) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:overdueOnly IS NULL OR (:overdueOnly = true AND t.status NOT IN ('COMPLETED', 'CANCELLED') AND t.dueDate IS NOT NULL AND t.dueDate < :currentDate))")
    Page<Task> findTasksWithFilters(
            @Param("status") TaskStatus status,
            @Param("priority") Priority priority,
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            @Param("overdueOnly") Boolean overdueOnly,
            @Param("currentDate") LocalDate currentDate,
            Pageable pageable);

    long countByStatus(TaskStatus status);

    long countByPriority(Priority priority);

    long countByCategoryId(Long categoryId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status NOT IN ('COMPLETED', 'CANCELLED') AND t.dueDate IS NOT NULL AND t.dueDate < :currentDate")
    long countOverdueTasks(@Param("currentDate") LocalDate currentDate);

    List<Task> findByStatusOrderByDueDateAsc(TaskStatus status);
}

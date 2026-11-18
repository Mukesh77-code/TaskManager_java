package com.taskmanager.config;

import com.taskmanager.entity.Category;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.repository.CategoryRepository;
import com.taskmanager.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;

    public DataInitializer(CategoryRepository categoryRepository, TaskRepository taskRepository) {
        this.categoryRepository = categoryRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        if (taskRepository.count() > 0) {
            log.info("Database already contains tasks. Skipping initial seeding.");
            return;
        }

        log.info("Seeding initial categories and tasks...");

        // Seed Categories
        Category backend = categoryRepository.save(new Category("Backend API", "#3B82F6", "Spring Boot & REST API services"));
        Category frontend = categoryRepository.save(new Category("Frontend UI", "#10B981", "Client-side interfaces and design"));
        Category database = categoryRepository.save(new Category("Database", "#8B5CF6", "MySQL schemas, indexing, and migrations"));
        Category devops = categoryRepository.save(new Category("DevOps", "#F59E0B", "Docker, CI/CD pipelines, and hosting"));
        Category documentation = categoryRepository.save(new Category("Docs & QA", "#EC4899", "Postman tests, Swagger, and README specs"));

        // Seed Tasks
        List<Task> sampleTasks = List.of(
                new Task(
                        "Design Layered Controller-Service-Repository Architecture",
                        "Structure the Spring Boot project into clean layers: Controller, Service, Repository, DTO, and Entity with proper separation of concerns.",
                        TaskStatus.COMPLETED,
                        Priority.HIGH,
                        LocalDate.now().minusDays(3),
                        backend
                ),
                new Task(
                        "Configure MySQL DataSource and Hibernate JPA Dialect",
                        "Set up application.properties with MySQL 8 JDBC connection URL, HikariCP connection pool, and JPA ddl-auto update settings.",
                        TaskStatus.COMPLETED,
                        Priority.URGENT,
                        LocalDate.now().minusDays(2),
                        database
                ),
                new Task(
                        "Implement Task CRUD Endpoints with Bean Validation",
                        "Develop GET, POST, PUT, PATCH, and DELETE endpoints under /api/v1/tasks. Enforce @NotBlank, @Size, and @NotNull constraints.",
                        TaskStatus.IN_PROGRESS,
                        Priority.HIGH,
                        LocalDate.now().plusDays(1),
                        backend
                ),
                new Task(
                        "Build Human-Crafted Interactive Dashboard UI",
                        "Design an aesthetic SaaS interface with Kanban board, data table view, real-time analytics cards, search filter, and task modal.",
                        TaskStatus.IN_PROGRESS,
                        Priority.URGENT,
                        LocalDate.now().plusDays(2),
                        frontend
                ),
                new Task(
                        "Create Comprehensive Postman Collection & Test Scripts",
                        "Export a Postman Collection covering all endpoints, positive/negative validation tests, status transitions, and environment variables.",
                        TaskStatus.PENDING,
                        Priority.MEDIUM,
                        LocalDate.now().plusDays(4),
                        documentation
                ),
                new Task(
                        "Setup GitHub Repository with CI/CD and README",
                        "Add complete README.md with architecture diagram, API documentation table, MySQL schema guide, and .gitignore file.",
                        TaskStatus.PENDING,
                        Priority.MEDIUM,
                        LocalDate.now().plusDays(5),
                        devops
                ),
                new Task(
                        "Resolve Legacy Database Migration Index Warning",
                        "Investigate missing secondary index on tasks(status, priority, due_date) to accelerate multi-condition queries.",
                        TaskStatus.PENDING,
                        Priority.URGENT,
                        LocalDate.now().minusDays(1), // Overdue sample task
                        database
                )
        );

        taskRepository.saveAll(sampleTasks);
        log.info("Successfully seeded {} categories and {} tasks.", categoryRepository.count(), taskRepository.count());
    }
}

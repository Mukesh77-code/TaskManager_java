-- =========================================================
-- Task Manager Initial Data Seed (MySQL)
-- =========================================================

USE `task_manager_db`;

-- Seed categories
INSERT INTO `categories` (`id`, `name`, `color`, `description`, `created_at`) VALUES
(1, 'Backend API', '#3B82F6', 'Spring Boot & REST API services', NOW()),
(2, 'Frontend UI', '#10B981', 'Client-side interfaces and design', NOW()),
(3, 'Database', '#8B5CF6', 'MySQL schemas, indexing, and migrations', NOW()),
(4, 'DevOps', '#F59E0B', 'Docker, CI/CD pipelines, and hosting', NOW()),
(5, 'Docs & QA', '#EC4899', 'Postman tests, Swagger, and README specs', NOW())
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed tasks
INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `priority`, `due_date`, `category_id`, `created_at`, `updated_at`) VALUES
(1, 'Design Layered Architecture', 'Structure project into Controller, Service, Repository, DTO, and Entity.', 'COMPLETED', 'HIGH', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, NOW(), NOW()),
(2, 'Configure MySQL DataSource and HikariCP', 'Configure connection parameters, driver, dialect and pool in application.properties.', 'COMPLETED', 'URGENT', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 3, NOW(), NOW()),
(3, 'Implement Task CRUD Endpoints', 'Develop GET, POST, PUT, PATCH, and DELETE endpoints under /api/v1/tasks.', 'IN_PROGRESS', 'HIGH', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, NOW(), NOW()),
(4, 'Build Modern Interactive UI', 'Develop responsive Kanban & table view, stats bar, and modals.', 'IN_PROGRESS', 'URGENT', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, NOW(), NOW()),
(5, 'Create Postman Collection & Test Suite', 'Export ready-to-test Postman collection with environments and assertions.', 'PENDING', 'MEDIUM', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 5, NOW(), NOW()),
(6, 'Setup GitHub Repo and Documentation', 'Prepare complete README, Git config, architecture diagrams and setup guides.', 'PENDING', 'MEDIUM', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 4, NOW(), NOW()),
(7, 'Address Overdue Database Optimization', 'Review composite index on tasks table for status, priority, and due_date.', 'PENDING', 'URGENT', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE `title`=`title`;

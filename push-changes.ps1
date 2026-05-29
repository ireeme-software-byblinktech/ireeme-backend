# Git Push Script - Push files one by one
# Excludes: .env, .env.example, .md files (except README), seed scripts

Write-Host "Starting file-by-file git push..." -ForegroundColor Green

# Get current branch
$branch = git branch --show-current
Write-Host "Current branch: $branch" -ForegroundColor Cyan

# Modified files to push
$modifiedFiles = @(
    "prisma/schema.prisma",
    "src/modules/attendance/attendance.controller.ts",
    "src/modules/attendance/attendance.repository.ts",
    "src/modules/attendance/attendance.service.ts",
    "src/modules/attendance/dto/mark-attendance.dto.ts",
    "src/modules/auth/auth.controller.ts",
    "src/modules/auth/auth.service.ts",
    "src/modules/dashboard/dashboard.controller.ts",
    "src/modules/dashboard/dashboard.module.ts",
    "src/modules/dashboard/dashboard.service.ts",
    "src/modules/elections/elections.controller.ts",
    "src/modules/elections/elections.repository.ts",
    "src/modules/elections/elections.service.ts",
    "src/modules/files/files.controller.ts",
    "src/modules/students/students.repository.ts",
    "src/modules/students/students.service.ts",
    "src/modules/teachers/dto/update-teacher.dto.ts",
    "src/modules/timetable/timetable.controller.ts",
    "src/modules/users/users.repository.ts",
    "src/modules/users/users.service.ts"
)

# New files to push
$newFiles = @(
    "prisma/migrations/20260527100440_migration_1/migration.sql",
    "prisma/migrations/20260528125952_add_teacher_attendance/migration.sql",
    "src/modules/attendance/dto/mark-teacher-attendance.dto.ts"
)

# Push modified files
foreach ($file in $modifiedFiles) {
    if (Test-Path $file) {
        Write-Host "`nProcessing: $file" -ForegroundColor Yellow
        git add $file
        git commit -m "Update: $file"
        git push origin $branch
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Pushed: $file" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "⊘ Skipped (not found): $file" -ForegroundColor Gray
    }
}

# Push new files
foreach ($file in $newFiles) {
    if (Test-Path $file) {
        Write-Host "`nProcessing: $file" -ForegroundColor Yellow
        git add $file
        git commit -m "Add: $file"
        git push origin $branch
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Pushed: $file" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "⊘ Skipped (not found): $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "All files processed!" -ForegroundColor Green
Write-Host "Excluded: .env, seed scripts, .md files (except README)" -ForegroundColor Cyan

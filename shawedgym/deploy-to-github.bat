@echo off
echo 🚀 ShawedGym Deployment Script - Face ID System
echo ================================================

echo.
echo 📋 Step 1: Checking Git Status...
git status

echo.
echo 📋 Step 2: Adding Face ID System Files...
git add add-face-id-support.sql
git add step1-add-columns.sql
git add step2-create-indexes.sql
git add step3-update-existing.sql
git add step4-create-function.sql
git add step5-create-trigger.sql
git add step6-verify.sql
git add run-face-id-migration.js
git add FACE_ID_SYSTEM.md

echo.
echo 📋 Step 3: Adding Device Integration Files...
git add test-device-integration.html
git add test-device-integration.js
git add DEVICE_INTEGRATION_TEST_SUMMARY.md
git add API_INTEGRATION.md

echo.
echo 📋 Step 4: Adding Database Files...
git add complete-database-fix.sql
git add fix-database-schema.sql
git add fix-database-step-by-step.sql
git add cleanup_duplicate_tables.sql
git add fix-trainers-schema.sql
git add fix-database-multi-tenancy.sql
git add URGENT-fix-trainers-database.sql

echo.
echo 📋 Step 5: Adding Testing Files...
git add test-api.js
git add test-auth-endpoints.js
git add test-backend-status.js
git add test-complete-solution.js
git add test-device-integration.js
git add test-endpoints-with-auth.js
git add test-existing-endpoints.js
git add test-login.js
git add test-members-endpoint.js
git add test-members.js
git add test-multi-tenant-setup.js
git add test-root-endpoints.js
git add test-simple-endpoint.js
git add test-specific-endpoints.js

echo.
echo 📋 Step 6: Adding Admin Management Files...
git add check-admin-user.js
git add check-plans-table.js
git add create-admin-user.sql
git add create-admin.js
git add debug-admin-login.js
git add debug-login-response.js
git add fix-admin-password.sql
git add quick-fix-admin.sql
git add test-admin-login-fixed.js
git add test-after-schema-fix.js
git add VERIFICATION_REPORT.md

echo.
echo 📋 Step 7: Adding Backend Files...
git add api-backend.js
git add backend-api.js
git add migration-endpoint.js
git add simple-api.cjs
git add debug-server.js

echo.
echo 📋 Step 8: Adding Database Setup Files...
git add database-trigger-setup.sql
git add fix-abdinasir-salary.sql
git add run-complete-fix.js
git add run-sql-fix.js
git add debug-and-fix-all.js

echo.
echo 📋 Step 9: Adding Updated Core Files...
git add server.js
git add src/components/AddMemberForm.jsx
git add src/components/FaceIDTest.jsx
git add src/App.jsx
git add src/components/Navbar.jsx
git add src/pages/Dashboard.jsx
git add src/components/StatCard.jsx
git add src/index.css

echo.
echo 📋 Step 10: Adding Deployment Files...
git add DEPLOYMENT_GUIDE.md
git add deploy-to-github.bat

echo.
echo 📋 Step 11: Committing Changes...
git commit -m "🚀 Add Face ID System & Device Integration

✅ New Features:
- Face ID system with automatic photo capture
- Device integration endpoints for face recognition
- Attendance tracking with face verification
- Member verification system
- Database migration scripts

✅ Updated Features:
- Optimized laptop view layout
- Enhanced member registration with photo requirement
- Improved sidebar navigation
- Better dashboard layout

✅ Testing Infrastructure:
- HTML test page for device integration
- Frontend test component
- Backend test scripts
- Comprehensive test suite

✅ Database Improvements:
- Face ID columns and indexes
- Photo storage integration
- Automatic face ID generation
- Database triggers and functions

🎯 Ready for production deployment!"

echo.
echo 📋 Step 12: Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment Complete!
echo ========================
echo.
echo 🎯 Next Steps:
echo 1. Check your GitHub repository
echo 2. Run database migration on production
echo 3. Test the new features
echo 4. Verify device integration works
echo.
echo 📞 If you need help, check DEPLOYMENT_GUIDE.md
echo.
pause

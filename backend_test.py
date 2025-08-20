#!/usr/bin/env python3
"""
Firebase Functions Smoke Test Suite
Comprehensive testing for Firebase Functions endpoints and Firestore security rules
"""

import os
import json
import re
import sys
import subprocess
from pathlib import Path

class FirebaseProjectTester:
    def __init__(self, project_path="/app"):
        self.project_path = Path(project_path)
        self.functions_path = self.project_path / "functions"
        self.src_path = self.functions_path / "src"
        self.tests_run = 0
        self.tests_passed = 0
        self.issues = []
        self.warnings = []

    def log_test(self, name, passed, message=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {message}")
            self.issues.append(f"{name}: {message}")
        if message and passed:
            print(f"   ℹ️  {message}")

    def log_warning(self, message):
        """Log warning"""
        print(f"⚠️  WARNING: {message}")
        self.warnings.append(message)

    def test_project_structure(self):
        """Test 1: Verify project structure exists"""
        required_paths = [
            self.functions_path,
            self.src_path,
            self.functions_path / "package.json",
            self.functions_path / "tsconfig.json",
            self.project_path / "firestore.rules",
            self.project_path / "storage.rules"
        ]
        
        missing = [p for p in required_paths if not p.exists()]
        self.log_test(
            "Project Structure", 
            len(missing) == 0,
            f"Missing paths: {missing}" if missing else "All required paths exist"
        )

    def test_package_dependencies(self):
        """Test 2: Check package.json dependencies"""
        package_json = self.functions_path / "package.json"
        if not package_json.exists():
            self.log_test("Package Dependencies", False, "package.json not found")
            return

        with open(package_json) as f:
            package_data = json.load(f)

        deps = package_data.get("dependencies", {})
        dev_deps = package_data.get("devDependencies", {})
        
        # Check for missing uuid dependency
        uuid_missing = "uuid" not in deps and "uuid" not in dev_deps
        if uuid_missing:
            self.log_test("UUID Dependency", False, "uuid package missing from dependencies")
        else:
            self.log_test("UUID Dependency", True, "uuid dependency found")

        # Check googleapis placement
        googleapis_in_dev = "googleapis" in dev_deps
        googleapis_in_deps = "googleapis" in deps
        
        if googleapis_in_dev and not googleapis_in_deps:
            self.log_warning("googleapis is in devDependencies but should be in dependencies for runtime use")
        elif googleapis_in_deps:
            self.log_test("GoogleAPIs Dependency", True, "googleapis in dependencies")
        else:
            self.log_test("GoogleAPIs Dependency", False, "googleapis not found")

        # Check luxon for attendance.ts
        luxon_exists = "luxon" in deps
        self.log_test("Luxon Dependency", luxon_exists, "Required for attendance.ts DateTime handling")

    def test_html_entities(self):
        """Test 3: Check for HTML entities in TypeScript files"""
        html_entities = ["&gt;", "&lt;", "&amp;", "&quot;", "&apos;"]
        found_entities = []
        
        for ts_file in self.src_path.glob("*.ts"):
            with open(ts_file, 'r', encoding='utf-8') as f:
                content = f.read()
                for entity in html_entities:
                    if entity in content:
                        found_entities.append(f"{ts_file.name}: {entity}")
        
        self.log_test(
            "HTML Entities Check",
            len(found_entities) == 0,
            f"Found entities: {found_entities}" if found_entities else "No HTML entities found"
        )

    def test_callable_functions_exist(self):
        """Test 4: Verify all required callable functions exist and are exported"""
        # Check compiled JavaScript exports
        compiled_index = self.functions_path / "lib" / "index.js"
        if not compiled_index.exists():
            self.log_test("Compiled Functions", False, "lib/index.js not found - run 'npm run build' in functions/")
            return

        with open(compiled_index) as f:
            compiled_content = f.read()

        # Required callable functions from review request
        required_callables = [
            "getUserProfile",
            "setUserRoleByEmail", 
            "setManagerForEmployeeByEmail",
            "clockIn", "clockOut",
            "applyLeave", "approveLeave", "declineLeave", "returnToWork", "approveReturnToWork",
            "acknowledgeAnnouncement",
            "generatePersonalDocUploadUrl", "generatePersonalDocDownloadUrl",
            "aiGenerate"
        ]

        missing_callables = []
        for func in required_callables:
            # Check if function is exported in compiled JS
            export_pattern = f'exports.{func}'
            if export_pattern not in compiled_content:
                missing_callables.append(func)

        self.log_test(
            "Required Callable Functions",
            len(missing_callables) == 0,
            f"Missing callables: {missing_callables}" if missing_callables else "All required callable functions found"
        )

        # Verify functions use https.onCall pattern
        source_index = self.src_path / "index.ts"
        if source_index.exists():
            with open(source_index) as f:
                source_content = f.read()
            
            # Check that functions are properly structured as callable functions
            for func in required_callables:
                if func in source_content:
                    # Find the actual function file and check if it uses https.onCall
                    self._verify_callable_structure(func)

    def _verify_callable_structure(self, func_name):
        """Verify a function uses the correct https.onCall structure"""
        # Map function names to their likely source files
        func_file_map = {
            "getUserProfile": "get-user-profile.ts",
            "setUserRoleByEmail": "admin.ts",
            "setManagerForEmployeeByEmail": "admin.ts", 
            "clockIn": "attendance.ts",
            "clockOut": "attendance.ts",
            "applyLeave": "leave.ts",
            "approveLeave": "leave.ts",
            "declineLeave": "leave.ts",
            "returnToWork": "leave.ts",
            "approveReturnToWork": "leave.ts",
            "acknowledgeAnnouncement": "announcements.ts",
            "generatePersonalDocUploadUrl": "storage.ts",
            "generatePersonalDocDownloadUrl": "storage.ts",
            "aiGenerate": "ai.ts"
        }
        
        file_name = func_file_map.get(func_name)
        if not file_name:
            return
            
        func_file = self.src_path / file_name
        if not func_file.exists():
            return
            
        with open(func_file) as f:
            content = f.read()
            
        # Check if function uses https.onCall
        if f"{func_name} = functions.https.onCall" not in content:
            self.warnings.append(f"{func_name} may not be properly structured as callable function")

    def test_firestore_rules_syntax(self):
        """Test 5: Basic Firestore rules syntax check"""
        rules_file = self.project_path / "firestore.rules"
        if not rules_file.exists():
            self.log_test("Firestore Rules", False, "firestore.rules not found")
            return

        with open(rules_file) as f:
            content = f.read()

        # Check for proper getUserData function
        getUserData_pattern = r"function getUserData\(\)\s*\{\s*return get\(/databases/\$\(database\)/documents/users/\$\(request\.auth\.uid\)\)\.data;"
        has_getUserData = bool(re.search(getUserData_pattern, content))
        
        # Check for basic structure
        has_rules_version = "rules_version = '2';" in content
        has_service_declaration = "service cloud.firestore" in content
        has_match_databases = "match /databases/{database}/documents" in content

        syntax_issues = []
        if not has_rules_version:
            syntax_issues.append("Missing rules_version declaration")
        if not has_service_declaration:
            syntax_issues.append("Missing service declaration")
        if not has_match_databases:
            syntax_issues.append("Missing database match")
        if not has_getUserData:
            syntax_issues.append("getUserData function not found or malformed")

        self.log_test(
            "Firestore Rules Syntax",
            len(syntax_issues) == 0,
            f"Issues: {syntax_issues}" if syntax_issues else "Basic syntax checks passed"
        )

    def test_storage_rules_alignment(self):
        """Test 6: Check storage rules alignment with signed URL functions"""
        storage_rules = self.project_path / "storage.rules"
        storage_ts = self.src_path / "storage.ts"
        
        if not storage_rules.exists() or not storage_ts.exists():
            self.log_test("Storage Rules Alignment", False, "Missing storage.rules or storage.ts")
            return

        with open(storage_rules) as f:
            rules_content = f.read()
        
        with open(storage_ts) as f:
            ts_content = f.read()

        # Check path alignment
        rules_has_personal_docs = "/personal-documents/{userId}/{docId}/{fileName}" in rules_content
        ts_has_matching_path = "personal-documents/${uid}/${docId}/${fileName}" in ts_content
        
        # Check access control alignment
        rules_has_owner_access = "isOwner()" in rules_content
        rules_has_manager_access = "isManager()" in rules_content
        rules_has_admin_access = "isAdmin()" in rules_content
        
        ts_has_access_check = "isManagerOf(caller, userId)" in ts_content and "isAdmin(claims)" in ts_content

        alignment_issues = []
        if not (rules_has_personal_docs and ts_has_matching_path):
            alignment_issues.append("Path structure mismatch between rules and functions")
        if not (rules_has_owner_access and rules_has_manager_access and rules_has_admin_access):
            alignment_issues.append("Missing access control functions in storage rules")
        if not ts_has_access_check:
            alignment_issues.append("Missing access control checks in storage functions")

        self.log_test(
            "Storage Rules Alignment",
            len(alignment_issues) == 0,
            f"Issues: {alignment_issues}" if alignment_issues else "Storage rules align with functions"
        )

    def test_typescript_imports(self):
        """Test 7: Check TypeScript imports for missing dependencies"""
        import_issues = []
        
        for ts_file in self.src_path.glob("*.ts"):
            with open(ts_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check for uuid import without dependency
            if 'from "uuid"' in content:
                import_issues.append(f"{ts_file.name}: imports uuid (check if dependency exists)")
            
            # Check for googleapis import
            if 'from "googleapis"' in content:
                import_issues.append(f"{ts_file.name}: imports googleapis (should be in dependencies, not devDependencies)")
            
            # Check for luxon import
            if 'from "luxon"' in content:
                import_issues.append(f"{ts_file.name}: imports luxon (verify dependency)")

        self.log_test(
            "TypeScript Imports",
            len(import_issues) == 0,
            f"Import issues: {import_issues}" if import_issues else "All imports look valid"
        )

    def test_function_completeness(self):
        """Test 8: Verify all mentioned functions exist"""
        expected_files = [
            "auth-blocking.ts", "admin.ts", "attendance.ts", "leave.ts",
            "announcements.ts", "policies.ts", "events.ts", "storage.ts", "export.ts"
        ]
        
        missing_files = []
        for file_name in expected_files:
            if not (self.src_path / file_name).exists():
                missing_files.append(file_name)

        self.log_test(
            "Function Files Completeness",
            len(missing_files) == 0,
            f"Missing files: {missing_files}" if missing_files else "All expected function files exist"
        )

    def run_all_tests(self):
        """Run all tests"""
        print("🔥 Firebase Functions Deployment Readiness Test")
        print("=" * 50)
        
        self.test_project_structure()
        self.test_package_dependencies()
        self.test_html_entities()
        self.test_index_exports()
        self.test_firestore_rules_syntax()
        self.test_storage_rules_alignment()
        self.test_typescript_imports()
        self.test_function_completeness()
        
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.issues:
            print("\n🚨 CRITICAL ISSUES (must fix before deploy):")
            for issue in self.issues:
                print(f"   • {issue}")
        
        if self.warnings:
            print("\n⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"   • {warning}")
        
        if not self.issues:
            print("\n✅ No critical deployment blockers found!")
        else:
            print(f"\n❌ {len(self.issues)} critical issues must be resolved before deployment")
        
        return len(self.issues) == 0

def main():
    tester = FirebaseProjectTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
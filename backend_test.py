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

    def test_firestore_security_rules(self):
        """Test 5: Verify Firestore security rules for required collections"""
        rules_file = self.project_path / "firestore.rules"
        if not rules_file.exists():
            self.log_test("Firestore Rules", False, "firestore.rules not found")
            return

        with open(rules_file) as f:
            content = f.read()

        # Required collections from review request
        required_collections = [
            "users", "leaveRequests", "leaveBalances", "announcements", "personalDocs"
        ]

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

        # Check collection-specific rules
        collection_issues = []
        
        # Users collection
        if "match /users/{userId}" not in content:
            collection_issues.append("Missing users collection rules")
        else:
            # Check for proper access controls
            if "isOwner(userId)" not in content and "request.auth.uid == userId" not in content:
                collection_issues.append("Users collection missing owner access control")
            if "hasRole('Admin')" not in content:
                collection_issues.append("Users collection missing admin access control")

        # Leave requests collection  
        if "match /leaveRequests/{requestId}" not in content:
            collection_issues.append("Missing leaveRequests collection rules")

        # Leave balances collection
        if "match /leaveBalances/{userId}" not in content:
            collection_issues.append("Missing leaveBalances collection rules")

        # Announcements collection
        if "match /announcements/{id}" not in content:
            collection_issues.append("Missing announcements collection rules")

        # Personal documents (can be subcollection under users)
        has_personal_docs = ("match /personalDocuments/{docId}" in content or 
                           "match /users/{userId}/personalDocuments/{docId}" in content)
        if not has_personal_docs:
            collection_issues.append("Missing personalDocuments collection rules")

        # Check for authentication functions
        auth_functions = ["isAuthenticated()", "getUserData()", "hasRole(", "isOwner("]
        missing_auth_functions = []
        for func in auth_functions:
            if func not in content:
                missing_auth_functions.append(func)

        all_issues = syntax_issues + collection_issues + [f"Missing auth function: {f}" for f in missing_auth_functions]

        self.log_test(
            "Firestore Security Rules",
            len(all_issues) == 0,
            f"Issues: {all_issues}" if all_issues else "Firestore rules properly configured for all required collections"
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

    def test_package_lockfile_sync(self):
        """Test 8: Check package.json lockfile synchronization for CI"""
        # Test root package.json
        root_package = self.project_path / "package.json"
        root_lock = self.project_path / "package-lock.json"
        
        # Test functions package.json  
        func_package = self.functions_path / "package.json"
        func_lock = self.functions_path / "package-lock.json"

        lockfile_issues = []

        # Check if lockfiles exist
        if root_package.exists() and not root_lock.exists():
            lockfile_issues.append("Root package-lock.json missing")
        if func_package.exists() and not func_lock.exists():
            lockfile_issues.append("Functions package-lock.json missing")

        # Test npm ci dry-run for both directories
        if root_package.exists() and root_lock.exists():
            try:
                result = subprocess.run(
                    ["npm", "ci", "--dry-run"], 
                    cwd=self.project_path, 
                    capture_output=True, 
                    text=True,
                    timeout=30
                )
                if result.returncode != 0:
                    lockfile_issues.append(f"Root npm ci dry-run failed: {result.stderr[:200]}")
            except (subprocess.TimeoutExpired, subprocess.SubprocessError) as e:
                lockfile_issues.append(f"Root npm ci test failed: {str(e)[:100]}")

        if func_package.exists() and func_lock.exists():
            try:
                result = subprocess.run(
                    ["npm", "ci", "--dry-run"], 
                    cwd=self.functions_path, 
                    capture_output=True, 
                    text=True,
                    timeout=30
                )
                if result.returncode != 0:
                    lockfile_issues.append(f"Functions npm ci dry-run failed: {result.stderr[:200]}")
            except (subprocess.TimeoutExpired, subprocess.SubprocessError) as e:
                lockfile_issues.append(f"Functions npm ci test failed: {str(e)[:100]}")

        self.log_test(
            "Package Lockfile Sync",
            len(lockfile_issues) == 0,
            f"Issues: {lockfile_issues}" if lockfile_issues else "Package lockfiles are synchronized for CI"
        )

    def run_all_tests(self):
        """Run all tests"""
        print("🔥 Firebase Functions Deployment Readiness Test")
        print("=" * 50)
        
        self.test_project_structure()
        self.test_package_dependencies()
        self.test_html_entities()
        self.test_callable_functions_exist()
        self.test_firestore_security_rules()
        self.test_storage_rules_alignment()
        self.test_typescript_imports()
        self.test_package_lockfile_sync()
        self.test_function_signatures()
        self.test_deployment_readiness()
        
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

    def test_function_signatures(self):
        """Test 9: Verify function signatures match https.onCall usage"""
        signature_issues = []
        
        # Key functions to check
        functions_to_check = {
            "get-user-profile.ts": ["getUserProfile"],
            "admin.ts": ["setUserRoleByEmail", "setManagerForEmployeeByEmail"],
            "attendance.ts": ["clockIn", "clockOut"],
            "leave.ts": ["applyLeave", "approveLeave", "declineLeave", "returnToWork", "approveReturnToWork"],
            "announcements.ts": ["acknowledgeAnnouncement"],
            "storage.ts": ["generatePersonalDocUploadUrl", "generatePersonalDocDownloadUrl"],
            "ai.ts": ["aiGenerate"]
        }

        for file_name, functions in functions_to_check.items():
            file_path = self.src_path / file_name
            if not file_path.exists():
                signature_issues.append(f"Missing file: {file_name}")
                continue
                
            with open(file_path) as f:
                content = f.read()
            
            for func_name in functions:
                # Check if function is properly exported and uses https.onCall
                export_pattern = f"export const {func_name} = functions.https.onCall"
                if export_pattern not in content:
                    signature_issues.append(f"{func_name} in {file_name} not properly structured as https.onCall")
                
                # Check for proper context parameter handling
                if f"{func_name} = functions.https.onCall(async (data, context)" not in content:
                    signature_issues.append(f"{func_name} missing proper (data, context) parameters")
                
                # Check for authentication handling
                if "context.auth" not in content and func_name != "getUserProfile":
                    signature_issues.append(f"{func_name} may be missing authentication checks")

        self.log_test(
            "Function Signatures",
            len(signature_issues) == 0,
            f"Issues: {signature_issues}" if signature_issues else "All functions properly structured for https.onCall"
        )

    def test_deployment_readiness(self):
        """Test 10: Overall deployment readiness check"""
        deployment_issues = []
        
        # Check if TypeScript compiles
        try:
            result = subprocess.run(
                ["npm", "run", "build"], 
                cwd=self.functions_path, 
                capture_output=True, 
                text=True,
                timeout=60
            )
            if result.returncode != 0:
                deployment_issues.append(f"TypeScript compilation failed: {result.stderr[:300]}")
        except (subprocess.TimeoutExpired, subprocess.SubprocessError) as e:
            deployment_issues.append(f"Build test failed: {str(e)[:100]}")

        # Check for required environment variables or configs
        firebase_json = self.project_path / "firebase.json"
        if firebase_json.exists():
            with open(firebase_json) as f:
                firebase_config = json.load(f)
            
            if "functions" not in firebase_config:
                deployment_issues.append("firebase.json missing functions configuration")
            else:
                func_config = firebase_config["functions"]
                if "source" not in func_config:
                    deployment_issues.append("firebase.json functions missing source directory")

        # Check for critical missing exports in compiled output
        compiled_index = self.functions_path / "lib" / "index.js"
        if compiled_index.exists():
            with open(compiled_index) as f:
                compiled_content = f.read()
            
            critical_exports = ["getUserProfile", "clockIn", "clockOut", "applyLeave", "aiGenerate"]
            missing_critical = [exp for exp in critical_exports if f"exports.{exp}" not in compiled_content]
            if missing_critical:
                deployment_issues.append(f"Missing critical exports in compiled output: {missing_critical}")

        self.log_test(
            "Deployment Readiness",
            len(deployment_issues) == 0,
            f"Issues: {deployment_issues}" if deployment_issues else "Project ready for deployment"
        )

def main():
    tester = FirebaseProjectTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
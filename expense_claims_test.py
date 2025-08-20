#!/usr/bin/env python3
"""
Expense Claims and Leaves Backend Validation Test
Focused testing for the review request requirements
"""

import os
import json
import re
import sys
import subprocess
from pathlib import Path

class ExpenseClaimsValidator:
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

    def test_expense_claims_firestore_rules(self):
        """Test 1: Verify Firestore rules for expenseClaims collection"""
        rules_file = self.project_path / "firestore.rules"
        if not rules_file.exists():
            self.log_test("ExpenseClaims Firestore Rules", False, "firestore.rules not found")
            return

        with open(rules_file) as f:
            content = f.read()

        # Check if expenseClaims collection exists
        if "match /expenseClaims/{claimId}" not in content:
            self.log_test("ExpenseClaims Firestore Rules", False, "expenseClaims collection rules not found")
            return

        issues = []
        
        # 1. Check Create rules: only owner with valid payload and status Pending
        create_rule_pattern = r"allow create: if isOwner\(request\.resource\.data\.userId\) && isValidNewExpenseClaim\(request\.resource\.data\)"
        if not re.search(create_rule_pattern, content):
            issues.append("Missing proper create rule for owner with valid payload")
        
        # Check validation function exists
        if "function isValidNewExpenseClaim(data)" not in content:
            issues.append("Missing isValidNewExpenseClaim validation function")
        else:
            # Check validation function enforces status Pending
            validation_section = content[content.find("function isValidNewExpenseClaim"):content.find("}", content.find("function isValidNewExpenseClaim"))]
            if "data.status == 'Pending'" not in validation_section:
                issues.append("Validation function doesn't enforce status 'Pending'")
            
            # Check required fields
            required_fields = ['userId', 'date', 'category', 'amount', 'description', 'receipt', 'status', 'submittedAt']
            for field in required_fields:
                if f"'{field}'" not in validation_section:
                    issues.append(f"Validation function missing required field: {field}")

        # 2. Check Read rules: owner, manager of owner, or Admin
        read_rule_pattern = r"allow read: if isOwner\(resource\.data\.userId\) \|\| isManagerOf\(resource\.data\.userId\) \|\| hasRole\('Admin'\)"
        if not re.search(read_rule_pattern, content):
            issues.append("Missing proper read rule for owner/manager/admin")

        # 3. Check Update rules: Admin/Manager can update; Owner only if still Pending and status unchanged
        update_rule_found = False
        expense_claims_start = content.find("match /expenseClaims/{claimId}")
        if expense_claims_start != -1:
            # Find the end of this match block by looking for the next match or end of service
            next_match = content.find("match /", expense_claims_start + 1)
            end_service = content.find("}", content.rfind("service cloud.firestore"))
            expense_claims_end = next_match if next_match != -1 and next_match < end_service else end_service
            update_section = content[expense_claims_start:expense_claims_end]
            
            # Look for complex update rule (multi-line)
            if "allow update: if" in update_section:
                # Check for all required components in the update section
                has_admin = "hasRole('Admin')" in update_section
                has_manager = "isManagerOf(resource.data.userId)" in update_section
                has_owner_pending = "isOwner(resource.data.userId)" in update_section and "resource.data.status == 'Pending'" in update_section
                has_status_unchanged = "request.resource.data.status == resource.data.status" in update_section
                
                if has_admin and has_manager and has_owner_pending and has_status_unchanged:
                    update_rule_found = True
        
        if not update_rule_found:
            issues.append("Missing proper update rule (Admin/Manager full access, Owner only if Pending and status unchanged)")

        # 4. Check Delete rules: Admin only
        delete_rule_pattern = r"allow delete: if hasRole\('Admin'\)"
        if not re.search(delete_rule_pattern, content):
            issues.append("Missing proper delete rule for Admin only")

        self.log_test(
            "ExpenseClaims Firestore Rules",
            len(issues) == 0,
            f"Issues: {issues}" if issues else "All expenseClaims rules properly configured"
        )

    def test_receipts_storage_rules(self):
        """Test 2: Verify Storage rules for receipts path"""
        storage_rules = self.project_path / "storage.rules"
        if not storage_rules.exists():
            self.log_test("Receipts Storage Rules", False, "storage.rules not found")
            return

        with open(storage_rules) as f:
            content = f.read()

        issues = []

        # Check if receipts path exists
        if "match /receipts/{userId}/{fileName}" not in content:
            issues.append("receipts path rule not found")
        else:
            # Find the receipts section more carefully
            receipts_start = content.find("match /receipts/{userId}/{fileName}")
            next_match = content.find("match /", receipts_start + 1)
            end_service = content.find("}", content.rfind("service firebase.storage"))
            receipts_end = next_match if next_match != -1 and next_match < end_service else end_service
            receipts_section = content[receipts_start:receipts_end]
            
            # Check owner write permission
            if "allow write: if request.auth != null && request.auth.uid == userId" not in receipts_section:
                issues.append("Missing owner write permission for receipts")
            
            # Check no direct read (should be false for signed URL pattern)
            if "allow read: if false" not in receipts_section:
                issues.append("Missing read denial (should use signed URLs)")

        self.log_test(
            "Receipts Storage Rules",
            len(issues) == 0,
            f"Issues: {issues}" if issues else "Receipts storage rules properly configured"
        )

    def test_functions_build_stability(self):
        """Test 3: Verify functions build stability and callable list"""
        compiled_index = self.functions_path / "lib" / "index.js"
        if not compiled_index.exists():
            self.log_test("Functions Build Stability", False, "lib/index.js not found - functions not compiled")
            return

        with open(compiled_index) as f:
            compiled_content = f.read()

        issues = []

        # Check that all expected callable functions are still present
        expected_callables = [
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
        for func in expected_callables:
            export_pattern = f'exports.{func}'
            if export_pattern not in compiled_content:
                missing_callables.append(func)

        if missing_callables:
            issues.append(f"Missing callable functions after rule edits: {missing_callables}")

        # Check for compilation errors in the output
        error_indicators = ["Error:", "TypeError:", "SyntaxError:", "ReferenceError:"]
        for error in error_indicators:
            if error in compiled_content:
                issues.append(f"Compilation error detected: {error}")

        self.log_test(
            "Functions Build Stability",
            len(issues) == 0,
            f"Issues: {issues}" if issues else "Functions build stable, all callables intact"
        )

    def test_leave_management_rules(self):
        """Test 4: Sanity check leave management rules are still intact"""
        rules_file = self.project_path / "firestore.rules"
        if not rules_file.exists():
            self.log_test("Leave Management Rules", False, "firestore.rules not found")
            return

        with open(rules_file) as f:
            content = f.read()

        issues = []

        # Check leaveRequests collection still exists
        if "match /leaveRequests/{requestId}" not in content:
            issues.append("leaveRequests collection rules missing")

        # Check leaveBalances collection still exists  
        if "match /leaveBalances/{userId}" not in content:
            issues.append("leaveBalances collection rules missing")

        # Check basic leave functions exist
        leave_functions = ["isValidNewLeaveRequest"]
        for func in leave_functions:
            if f"function {func}" not in content:
                issues.append(f"Missing leave function: {func}")

        self.log_test(
            "Leave Management Rules",
            len(issues) == 0,
            f"Issues: {issues}" if issues else "Leave management rules intact"
        )

    def check_blocking_issues(self):
        """Test 5: Check for any blocking deployment issues"""
        blocking_issues = []

        # Check if firebase.json exists and is valid
        firebase_json = self.project_path / "firebase.json"
        if not firebase_json.exists():
            blocking_issues.append("firebase.json missing")
        else:
            try:
                with open(firebase_json) as f:
                    firebase_config = json.load(f)
                if "functions" not in firebase_config:
                    blocking_issues.append("firebase.json missing functions configuration")
            except json.JSONDecodeError:
                blocking_issues.append("firebase.json is invalid JSON")

        # Check TypeScript compilation
        try:
            # Use increased heap size for compilation
            result = subprocess.run(
                ["node", "--max-old-space-size=4096", "node_modules/.bin/tsc"], 
                cwd=self.functions_path, 
                capture_output=True, 
                text=True,
                timeout=120
            )
            if result.returncode != 0:
                blocking_issues.append(f"TypeScript compilation failed: {result.stderr[:200]}")
        except (subprocess.TimeoutExpired, subprocess.SubprocessError) as e:
            blocking_issues.append(f"Build test failed: {str(e)[:100]}")

        self.log_test(
            "Blocking Issues Check",
            len(blocking_issues) == 0,
            f"Blocking issues: {blocking_issues}" if blocking_issues else "No blocking deployment issues found"
        )

    def run_validation(self):
        """Run all validation tests"""
        print("🔍 Expense Claims and Leaves Backend Validation")
        print("=" * 55)
        
        self.test_expense_claims_firestore_rules()
        self.test_receipts_storage_rules()
        self.test_functions_build_stability()
        self.test_leave_management_rules()
        self.check_blocking_issues()
        
        print("\n" + "=" * 55)
        print(f"📊 Validation Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.issues:
            print("\n🚨 CRITICAL ISSUES:")
            for issue in self.issues:
                print(f"   • {issue}")
        
        if self.warnings:
            print("\n⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"   • {warning}")
        
        if not self.issues:
            print("\n✅ All validation checks passed!")
            print("\n📋 SUMMARY:")
            print("   • ExpenseClaims Firestore rules: ✅ Properly configured")
            print("   • Receipts storage rules: ✅ Owner write, no direct read")
            print("   • Functions build stability: ✅ All callables intact")
            print("   • Leave management: ✅ Rules preserved")
            print("   • No blocking issues: ✅ Ready for deployment")
        else:
            print(f"\n❌ {len(self.issues)} critical issues found")
        
        return len(self.issues) == 0

def main():
    validator = ExpenseClaimsValidator()
    success = validator.run_validation()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
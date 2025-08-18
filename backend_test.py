import requests
import sys
import json
from datetime import datetime

class IntegrationStatusAPITester:
    def __init__(self, base_url="https://integration-check-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_status_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the root health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_create_status_check(self, client_name, status="healthy", response_time_ms=5):
        """Create a status check"""
        success, response = self.run_test(
            f"Create Status Check - {client_name}",
            "POST",
            "status",
            200,
            data={
                "client_name": client_name,
                "status": status,
                "response_time_ms": response_time_ms
            }
        )
        if success and 'id' in response:
            self.created_status_ids.append(response['id'])
            return response['id']
        return None

    def test_get_status_checks(self):
        """Get all status checks"""
        success, response = self.run_test(
            "Get All Status Checks",
            "GET",
            "status",
            200
        )
        if success:
            print(f"   Found {len(response)} status checks")
        return success, response

    def test_get_stats(self):
        """Get dashboard statistics"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "stats",
            200
        )
        if success:
            print(f"   Stats: Total={response.get('total_checks')}, Active Today={response.get('active_today')}, Avg Response={response.get('avg_response_time')}ms")
        return success, response

    def test_delete_status_check(self, status_id):
        """Delete a status check"""
        success, response = self.run_test(
            f"Delete Status Check - {status_id[:8]}...",
            "DELETE",
            f"status/{status_id}",
            200
        )
        return success

    def cleanup_created_status_checks(self):
        """Clean up any status checks created during testing"""
        print(f"\n🧹 Cleaning up {len(self.created_status_ids)} created status checks...")
        for status_id in self.created_status_ids:
            self.test_delete_status_check(status_id)

def main():
    print("🚀 Starting Integration Status Monitor API Tests")
    print("=" * 60)
    
    # Setup
    tester = IntegrationStatusAPITester()
    
    # Test 1: Health Check
    if not tester.test_health_check():
        print("❌ Health check failed, API might be down")
        return 1

    # Test 2: Get initial stats
    print("\n📊 Getting initial stats...")
    initial_success, initial_stats = tester.test_get_stats()
    if not initial_success:
        print("❌ Failed to get initial stats")
        return 1

    # Test 3: Get initial status checks
    print("\n📋 Getting initial status checks...")
    checks_success, initial_checks = tester.test_get_status_checks()
    if not checks_success:
        print("❌ Failed to get initial status checks")
        return 1

    # Test 4: Create multiple status checks
    print("\n➕ Creating test status checks...")
    test_clients = [
        ("AWS S3", "healthy", 3),
        ("Google Auth", "healthy", 7),
        ("Stripe API", "healthy", 12),
        ("SendGrid", "healthy", 5)
    ]
    
    created_ids = []
    for client_name, status, response_time in test_clients:
        status_id = tester.test_create_status_check(client_name, status, response_time)
        if status_id:
            created_ids.append(status_id)
        else:
            print(f"❌ Failed to create status check for {client_name}")

    # Test 5: Verify status checks were created
    print("\n🔍 Verifying created status checks...")
    checks_success, updated_checks = tester.test_get_status_checks()
    if checks_success:
        print(f"   Status checks increased from {len(initial_checks)} to {len(updated_checks)}")
        if len(updated_checks) >= len(initial_checks) + len(created_ids):
            print("✅ All status checks were created successfully")
        else:
            print("⚠️  Some status checks may not have been created")

    # Test 6: Verify stats updated
    print("\n📈 Verifying stats updated...")
    stats_success, updated_stats = tester.test_get_stats()
    if stats_success:
        print(f"   Total checks: {initial_stats.get('total_checks', 0)} → {updated_stats.get('total_checks', 0)}")
        print(f"   Healthy count: {initial_stats.get('healthy_count', 0)} → {updated_stats.get('healthy_count', 0)}")
        if updated_stats.get('total_checks', 0) > initial_stats.get('total_checks', 0):
            print("✅ Stats updated correctly")
        else:
            print("⚠️  Stats may not have updated properly")

    # Test 7: Test delete functionality
    if created_ids:
        print(f"\n🗑️  Testing delete functionality...")
        first_id = created_ids[0]
        if tester.test_delete_status_check(first_id):
            print("✅ Delete functionality works")
            # Remove from cleanup list since we already deleted it
            tester.created_status_ids.remove(first_id)
        else:
            print("❌ Delete functionality failed")

    # Cleanup remaining test data
    tester.cleanup_created_status_checks()

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All API tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
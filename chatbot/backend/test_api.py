"""
Simple test script for RAG Chatbot Backend API.
Tests basic functionality without requiring book data in Qdrant.
"""
import requests
import json
import sys
from typing import Dict, Any


BASE_URL = "http://localhost:8000"


def print_response(title: str, response: requests.Response):
    """Pretty print response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"\nResponse Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)


def test_health_check():
    """Test health check endpoint"""
    print("\n🏥 Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print_response("Health Check", response)

        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print("✅ Health check PASSED")
                return True

        print("❌ Health check FAILED")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Is the server running on http://localhost:8000?")
        print("   Run: poetry run python src/main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_root_endpoint():
    """Test root endpoint"""
    print("\n📄 Testing Root Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print_response("Root Endpoint", response)

        if response.status_code == 200:
            print("✅ Root endpoint PASSED")
            return True

        print("❌ Root endpoint FAILED")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_query_endpoint():
    """Test query endpoint (will return 'not available' without book data)"""
    print("\n💬 Testing Query Endpoint...")

    query_data = {
        "query_text": "What is ROS 2?",
        "selected_text": None,
        "session_id": None
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json=query_data,
            timeout=30  # LLM calls can take time
        )
        print_response("Query Endpoint", response)

        if response.status_code == 200:
            data = response.json()

            # Check response structure
            required_fields = ["query_id", "session_id", "answer", "processing_time_ms"]
            if all(field in data for field in required_fields):
                print("\n📊 Response Analysis:")
                print(f"  - Query ID: {data['query_id']}")
                print(f"  - Session ID: {data['session_id']}")
                print(f"  - Processing Time: {data['processing_time_ms']}ms")
                print(f"  - Answer: {data['answer']['answer_text'][:100]}...")
                print(f"  - Citations: {len(data['answer']['citations'])}")
                print(f"  - Confidence: {data['answer']['confidence_score']}")

                # Expected: "not available" response when no book data
                if "not available" in data['answer']['answer_text'].lower():
                    print("\n✅ Query endpoint PASSED (returned 'not available' as expected)")
                    print("   Note: This is correct behavior when Qdrant has no book data yet")
                    return True
                else:
                    print("\n✅ Query endpoint PASSED (found relevant content!)")
                    print("   Note: Book data exists in Qdrant")
                    return True

        print("❌ Query endpoint FAILED")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout: Query took longer than 30 seconds")
        print("   Check if OpenAI API key is valid and services are responding")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_conversation_endpoint():
    """Test conversation history endpoint"""
    print("\n💾 Testing Conversation History Endpoint...")

    # Use a test session ID
    session_id = "00000000-0000-0000-0000-000000000001"

    try:
        response = requests.get(
            f"{BASE_URL}/api/conversation/{session_id}",
            timeout=5
        )
        print_response("Conversation History", response)

        # 404 is expected if no conversation exists
        if response.status_code in [200, 404]:
            if response.status_code == 404:
                print("✅ Conversation endpoint PASSED (404 for non-existent session - expected)")
            else:
                print("✅ Conversation endpoint PASSED")
            return True

        print("❌ Conversation endpoint FAILED")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_api_docs():
    """Test that API documentation is accessible"""
    print("\n📚 Testing API Documentation...")
    try:
        response = requests.get(f"{BASE_URL}/api/docs", timeout=5)

        if response.status_code == 200:
            print(f"✅ API docs available at: {BASE_URL}/api/docs")
            return True

        print("❌ API docs FAILED")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("RAG CHATBOT BACKEND API TEST SUITE")
    print("="*60)

    tests = [
        ("Health Check", test_health_check),
        ("Root Endpoint", test_root_endpoint),
        ("API Documentation", test_api_docs),
        ("Query Endpoint", test_query_endpoint),
        ("Conversation History", test_conversation_endpoint),
    ]

    results = []

    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            results.append((test_name, False))

    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")

    print(f"\nTotal: {passed_count}/{total_count} tests passed")

    if passed_count == total_count:
        print("\n🎉 All tests PASSED!")
        return 0
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())

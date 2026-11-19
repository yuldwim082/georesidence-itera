import pytest
import math
from app.services.privacy_service import calculate_public_coordinates

def test_privacy_displacement():
    # Original ITERA coordinate
    orig_lat, orig_lon = -5.358241, 105.312984
    pub_lat, pub_lon = calculate_public_coordinates(orig_lat, orig_lon, seed_identifier="121110001")
    
    # Must match original coordinates directly without generalization
    assert (orig_lat, orig_lon) == (pub_lat, pub_lon)

def test_admin_login(client):
    # Correct login
    res = client.post("/api/admin/login", json={"username": "admin_test", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Invalid password
    bad_res = client.post("/api/admin/login", json={"username": "admin_test", "password": "wrongpassword"})
    assert bad_res.status_code == 401

def test_student_crud_and_privacy_isolation(client):
    # Login to get token
    login_res = client.post("/api/admin/login", json={"username": "admin_test", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Student
    create_payload = {
        "nim": "121110099",
        "name": "Budi Raharja",
        "residence_type": "Kost",
        "latitude": -5.361234,
        "longitude": 105.314567,
        "consent_publication": True,
        "is_published": True
    }
    create_res = client.post("/api/admin/students", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    created_student = create_res.json()
    assert created_student["nim"] == "121110099"
    assert created_student["public_latitude"] is not None
    assert created_student["public_longitude"] is not None
    student_id = created_student["id"]

    # 2. Check Public Endpoint
    public_res = client.get("/api/public/students")
    assert public_res.status_code == 200
    public_list = public_res.json()
    assert len(public_list) == 1
    pub_item = public_list[0]
    
    # CRITICAL: Verify NIM and exact coords are NOT exposed in public response!
    assert "nim" not in pub_item
    assert "latitude" not in pub_item
    assert "longitude" not in pub_item
    assert "consent_publication" not in pub_item
    assert "public_latitude" in pub_item
    assert "public_longitude" in pub_item
    assert pub_item["name"] == "Budi Raharja"

    # 3. Unpublish the student and check public endpoint again
    update_res = client.put(
        f"/api/admin/students/{student_id}",
        json={"is_published": False},
        headers=headers
    )
    assert update_res.status_code == 200

    public_res_after = client.get("/api/public/students")
    assert public_res_after.status_code == 200
    assert len(public_res_after.json()) == 0  # Unpublished, must not be visible to public!

    # 4. Check Public Statistics
    stats_res = client.get("/api/public/statistics")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_students"] == 0  # Since unpublished

def test_reset_all_students(client):
    login_res = client.post("/api/admin/login", json={"username": "admin_test", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add 2 students
    client.post("/api/admin/students", json={
        "nim": "121110001", "name": "Student A", "residence_type": "Kost",
        "latitude": -5.358241, "longitude": 105.312984
    }, headers=headers)
    client.post("/api/admin/students", json={
        "nim": "121110002", "name": "Student B", "residence_type": "Rumah",
        "latitude": -5.372105, "longitude": 105.289123
    }, headers=headers)

    # Check count is 2
    dash_res = client.get("/api/admin/dashboard", headers=headers)
    assert dash_res.json()["total_students"] >= 2

    # Reset all
    reset_res = client.delete("/api/admin/students/reset-all", headers=headers)
    assert reset_res.status_code == 200
    assert reset_res.json()["deleted_count"] >= 2

    # Check count is 0
    dash_after = client.get("/api/admin/dashboard", headers=headers)
    assert dash_after.json()["total_students"] == 0

import io
from fastapi.testclient import TestClient

def test_import_csv_preview_and_confirm(client):
    # Login
    login_res = client.post("/api/admin/login", json={"username": "admin_test", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Prepare CSV content with 1 valid row, 1 duplicate row, 1 invalid coordinates row
    csv_data = (
        "NIM,Nama,Kategori,Latitude,Longitude\n"
        "121110010,Mahasiswa Satu,Kost,-5.358241,105.312984\n"
        "121110010,Mahasiswa Duplikat,Rumah,-5.360000,105.310000\n"
        "121110020,Mahasiswa Invalid Lat,Kontrakan,999.000,105.320000\n"
    )

    # 1. Preview
    files = {"file": ("test.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}
    preview_res = client.post("/api/admin/import/preview", files=files, headers=headers)
    assert preview_res.status_code == 200
    preview = preview_res.json()
    
    assert preview["total_rows"] == 3
    assert preview["valid_rows"] == 1
    assert preview["duplicate_rows"] == 1
    assert preview["invalid_rows"] == 2  # 1 duplicate + 1 out-of-range lat
    
    # Check row errors
    rows = preview["preview"]
    assert rows[0]["is_valid"] is True
    assert rows[1]["is_duplicate"] is True
    assert any("Duplikat" in err for err in rows[1]["errors"])
    assert any("di luar batas" in err for err in rows[2]["errors"])

    # 2. Confirm import with valid row
    confirm_payload = {
        "skip_duplicates": True,
        "rows": [rows[0]]
    }
    confirm_res = client.post("/api/admin/import/confirm", json=confirm_payload, headers=headers)
    assert confirm_res.status_code == 200
    result = confirm_res.json()
    assert result["imported_count"] == 1
    assert result["failed_count"] == 0

    # Verify student is in DB and public endpoint
    pub_res = client.get("/api/public/students")
    assert pub_res.status_code == 200
    assert len(pub_res.json()) == 1
    assert pub_res.json()[0]["name"] == "Mahasiswa Satu"

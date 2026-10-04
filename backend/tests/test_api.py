from fastapi.testclient import TestClient


def create_organization(client: TestClient, *, suffix: str = "one") -> dict:
    response = client.post(
        "/api/v1/organizations",
        json={
            "name": f"Студия {suffix}",
            "owner_name": "Анна Иванова",
            "owner_email": f"owner.{suffix}@example.com",
            "business_type": "dance",
            "enabled_modules": ["subscriptions", "scheduling"],
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def create_student(client: TestClient, organization_id: int, *, name: str = "Иван Петров") -> dict:
    response = client.post(
        f"/api/v1/organizations/{organization_id}/students",
        json={
            "name": name,
            "group_name": "Продвинутая группа",
            "guardian": "Мария Петрова",
            "phone": "+7 900 000-00-00",
            "email": "student@example.com",
            "birth_date": "2015-04-12",
            "notes": "Пробное занятие",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_health(client: TestClient) -> None:
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/api/v1/health").json() == {"status": "ok"}


def test_organization_crud_and_duplicate_owner_email(client: TestClient) -> None:
    organization = create_organization(client)
    organization_id = organization["id"]

    assert organization["name"] == "Студия one"
    assert organization["students"] == []

    listed = client.get("/api/v1/organizations?skip=0&limit=10")
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["id"] == organization_id

    updated = client.patch(
        f"/api/v1/organizations/{organization_id}",
        json={"name": "Студия Ритм", "enabled_modules": ["finance"]},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Студия Ритм"
    assert updated.json()["enabled_modules"] == ["finance"]

    duplicate = client.post(
        "/api/v1/organizations",
        json={
            "name": "Второй бизнес",
            "owner_name": "Другой владелец",
            "owner_email": "owner.one@example.com",
            "business_type": "sports",
        },
    )
    assert duplicate.status_code == 409
    assert "email" in duplicate.json()["detail"]

    assert client.delete(f"/api/v1/organizations/{organization_id}").status_code == 204
    assert client.get(f"/api/v1/organizations/{organization_id}").status_code == 404


def test_student_crud_archive_filter_and_organization_cascade(client: TestClient) -> None:
    organization = create_organization(client)
    organization_id = organization["id"]
    student = create_student(client, organization_id)
    student_id = student["id"]

    assert student["birth_date"] == "2015-04-12"
    assert student["organization_id"] == organization_id

    fetched = client.get(f"/api/v1/organizations/{organization_id}/students/{student_id}")
    assert fetched.status_code == 200
    assert fetched.json()["name"] == "Иван Петров"

    updated = client.patch(
        f"/api/v1/organizations/{organization_id}/students/{student_id}",
        json={"name": "Иван Смирнов", "archived": True},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Иван Смирнов"
    assert updated.json()["archived"] is True

    archived_list = client.get(f"/api/v1/organizations/{organization_id}/students?archived=true")
    assert archived_list.json()["total"] == 1
    active_list = client.get(f"/api/v1/organizations/{organization_id}/students?archived=false")
    assert active_list.json()["total"] == 0

    org_detail = client.get(f"/api/v1/organizations/{organization_id}")
    assert len(org_detail.json()["students"]) == 1

    assert client.delete(f"/api/v1/organizations/{organization_id}").status_code == 204
    assert client.get(f"/api/v1/organizations/{organization_id}/students/{student_id}").status_code == 404


def test_student_search_pagination_and_tenant_isolation(client: TestClient) -> None:
    first = create_organization(client)
    second = create_organization(client, suffix="two")
    first_student = create_student(client, first["id"], name="Иван Петров")
    create_student(client, first["id"], name="Ольга Смирнова")
    other_student = create_student(client, second["id"], name="Иван Петров")

    search = client.get(f"/api/v1/organizations/{first['id']}/students?search=Иван")
    assert search.json()["total"] == 1
    assert search.json()["items"][0]["id"] == first_student["id"]

    page = client.get(f"/api/v1/organizations/{first['id']}/students?skip=1&limit=1")
    assert page.json()["total"] == 2
    assert len(page.json()["items"]) == 1

    cross_tenant = client.get(
        f"/api/v1/organizations/{first['id']}/students/{other_student['id']}"
    )
    assert cross_tenant.status_code == 404


def test_validation_and_missing_resources_return_clear_errors(client: TestClient) -> None:
    bad_organization = client.post(
        "/api/v1/organizations",
        json={
            "name": " ",
            "owner_name": "Анна",
            "owner_email": "not-an-email",
            "business_type": "unknown",
        },
    )
    assert bad_organization.status_code == 422
    assert bad_organization.json()["detail"]

    organization = create_organization(client)
    bad_student = client.post(
        f"/api/v1/organizations/{organization['id']}/students",
        json={"name": " ", "group_name": "Группа"},
    )
    assert bad_student.status_code == 422

    missing_organization = client.get("/api/v1/organizations/9999")
    assert missing_organization.status_code == 404
    assert missing_organization.json()["detail"] == "Организация не найдена"

    missing_student = client.get(f"/api/v1/organizations/{organization['id']}/students/9999")
    assert missing_student.status_code == 404
    assert missing_student.json()["detail"] == "Ученик не найден"

    no_patch_fields = client.patch(f"/api/v1/organizations/{organization['id']}", json={})
    assert no_patch_fields.status_code == 422


def test_student_delete_returns_no_content(client: TestClient) -> None:
    organization = create_organization(client)
    student = create_student(client, organization["id"])
    url = f"/api/v1/organizations/{organization['id']}/students/{student['id']}"

    response = client.delete(url)
    assert response.status_code == 204
    assert response.content == b""
    assert client.get(url).status_code == 404

"""
RailBlock AI — Automated Appendix Evidence & Screenshot Capture
Captures high-resolution UI screenshots and terminal verification output for submission reports.
"""

import os
import subprocess
import time

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"D:\projects\Railblock AI\docs\screenshots"
BASE_URL = "http://localhost:5173"

os.makedirs(OUTPUT_DIR, exist_ok=True)

SHOTS = [
    ("01_jwt_role_login.png", f"{BASE_URL}/?tab=login", 4000),
    ("02_maintenance_task_submission.png", f"{BASE_URL}/?tab=tasks&modal=new-task", 4000),
    ("03_conflict_detection.png", f"{BASE_URL}/?tab=conflicts", 4000),
    ("04_scheduler_ortools_gantt.png", f"{BASE_URL}/?tab=scheduler", 4000),
    ("05_plan_comparison_metrics.png", f"{BASE_URL}/?tab=compare", 4000),
    ("06_dashboard_admin_center.png", f"{BASE_URL}/?tab=dashboard", 4000),
    ("07_sector_assignment_kanban.png", f"{BASE_URL}/?tab=sectors", 4000),
    ("08_data_pipeline_dataset.png", f"{BASE_URL}/?tab=pipeline", 4000),
]

print("[1/2] Capturing UI Screenshots with Headless Chrome...")
for filename, url, budget in SHOTS:
    dest = os.path.join(OUTPUT_DIR, filename)
    cmd = [
        CHROME_PATH,
        "--headless=new",
        f"--screenshot={dest}",
        "--window-size=1440,900",
        f"--virtual-time-budget={budget}",
        url
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=15)
        size_kb = os.path.getsize(dest) / 1024
        print(f"  ✓ Captured {filename} ({size_kb:.1f} KB)")
    except Exception as e:
        print(f"  ✗ Failed {filename}: {e}")

print("\n[2/2] Generating Pytest and Database Seed Terminal Output...")
try:
    seed_res = subprocess.run(
        ["python", "-m", "app.db.seed"],
        cwd=r"D:\projects\Railblock AI\backend",
        capture_output=True,
        text=True,
        timeout=30
    )
    print("Seed Output:\n", seed_res.stdout)
except Exception as e:
    print(f"Seed failed: {e}")

try:
    pytest_res = subprocess.run(
        ["pytest"],
        cwd=r"D:\projects\Railblock AI",
        capture_output=True,
        text=True,
        timeout=30
    )
    print("Pytest Output:\n", pytest_res.stdout)
    with open(os.path.join(OUTPUT_DIR, "terminal_pytest_output.txt"), "w", encoding="utf-8") as f:
        f.write("=== DATABASE SEED OUTPUT ===\n")
        f.write(seed_res.stdout)
        f.write("\n=== PYTEST RUN OUTPUT ===\n")
        f.write(pytest_res.stdout)
    print(f"  ✓ Saved terminal output to {os.path.join(OUTPUT_DIR, 'terminal_pytest_output.txt')}")
except Exception as e:
    print(f"Pytest failed: {e}")

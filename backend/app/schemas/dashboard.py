from typing import Dict, Optional, Any
from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_assets: int
    assets_by_status: Dict[str, int]
    assets_by_department: Dict[str, int]
    
    total_tasks: int
    tasks_by_department: Dict[str, int]
    tasks_by_status: Dict[str, int]
    overdue_tasks_count: int
    high_criticality_tasks_count: int
    
    total_trains: int
    total_block_windows: int
    total_corridors: int
    
    latest_plan: Optional[Dict[str, Any]] = None

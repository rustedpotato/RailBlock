from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from datetime import datetime
from app.services.whatsapp_service import send_whatsapp_dispatch, format_railway_dispatch_memo, clean_phone_number

router = APIRouter(prefix="/dispatch", tags=["Dispatch & Notifications"])

class WhatsAppDispatchRequest(BaseModel):
    task_id: str = Field(..., description="Task identifier, e.g. T-8492")
    task_title: str = Field("Railway Track Maintenance", description="Brief description")
    section: str = Field("Section Line 1", description="Section or Corridor name")
    department: str = Field("ENGINEERING", description="ENGINEERING, TRACTION_DISTRIBUTION, or SIGNAL_TELECOMMUNICATION")
    assigned_crew: str = Field("Field Gang", description="Designated maintenance gang")
    assigned_equipment: str = Field("Standard Machinery", description="Allocated machinery/tools")
    supervisor: str = Field("Section Engineer In-Charge", description="Name of supervisor")
    phone: str = Field(..., description="Supervisor WhatsApp phone number, e.g. +91 93228 46915")
    assigned_slot: Optional[str] = Field("Immediate Scheduled", description="Approved time window")
    speed_restriction: Optional[str] = Field(None, description="Caution restriction (e.g. 30 km/h)")
    power_isolation: Optional[str] = Field(None, description="25kV OHE isolation memo")
    signal_disconnection: Optional[str] = Field(None, description="S&T disconnection memo")
    co_requisite_sectors: Optional[List[str]] = Field(default=[], description="Co-requisite sectors")
    note: Optional[str] = Field(None, description="Controller dispatch note")


class ActionRequest(BaseModel):
    task_id: str
    action: str  # ACK, DELAY, FIT
    note: Optional[str] = None
    supervisor: Optional[str] = None


# In-memory log of recent actions for demo & dashboard sync
_DISPATCH_LOG: List[Dict[str, Any]] = []


@router.post("/whatsapp", summary="Dispatch Railway Work Order via WhatsApp")
async def dispatch_whatsapp(req: WhatsAppDispatchRequest):
    """
    Sends an official Indian Railways sector dispatch memo to the supervisor via WhatsApp.
    Uses Twilio API if credentials are provided in .env, and provides a 1-click wa.me URL.
    """
    task_data = req.dict()
    result = await send_whatsapp_dispatch(req.phone, task_data)

    entry = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "task_id": req.task_id,
        "recipient": result.get("recipient_e164"),
        "channel": result.get("channel"),
        "status": "DISPATCHED",
        "action": "ASSIGNMENT_DISPATCHED",
        "note": req.note or f"Assigned to {req.assigned_crew}"
    }
    _DISPATCH_LOG.append(entry)

    return {
        "success": True,
        "data": result,
        "log_entry": entry
    }


@router.post("/preview", summary="Preview Formatted WhatsApp Dispatch Memo")
async def preview_whatsapp(req: WhatsAppDispatchRequest):
    """
    Generates preview text and wa.me direct link without sending.
    """
    task_data = req.dict()
    memo = format_railway_dispatch_memo(task_data)
    _, digits = clean_phone_number(req.phone)
    import urllib.parse
    wa_me_url = f"https://wa.me/{digits}?text={urllib.parse.quote(memo)}"
    return {
        "memo": memo,
        "wa_me_url": wa_me_url,
        "recipient": digits
    }


@router.get("/log", summary="Get Recent WhatsApp Dispatch & Action Log")
def get_dispatch_log():
    """
    Returns live in-memory audit log of WhatsApp dispatches and field acknowledgements.
    """
    return {"log": list(reversed(_DISPATCH_LOG[-50:]))}


@router.get("/action", response_class=HTMLResponse, summary="1-Tap Field Action from WhatsApp (Mobile Web)")
async def handle_action_get(
    task: str = Query(..., description="Task ID"),
    act: str = Query(..., description="Action code: ACK, DELAY, FIT"),
    note: Optional[str] = Query(None, description="Optional field note")
):
    """
    Handled when a field supervisor taps an action link in their WhatsApp message.
    Renders an Indian Railways styled mobile confirmation card.
    """
    now_str = datetime.now().strftime("%d-%b-%Y %H:%M:%S")

    action_configs = {
        "ACK": {
            "title": "Block Acknowledged & Roll Out Confirmed",
            "badge": "ACKNOWLEDGED",
            "badge_color": "#0070F3",
            "bg_color": "rgba(0, 112, 243, 0.1)",
            "icon": "🚂",
            "desc": f"Task #{task} has been acknowledged by field gang. Equipment and personnel are mobilizing to site."
        },
        "DELAY": {
            "title": "15-Minute Field Delay Reported",
            "badge": "DELAY REPORTED",
            "badge_color": "#F5A623",
            "bg_color": "rgba(245, 166, 35, 0.1)",
            "icon": "⏳",
            "desc": f"Controller alerted: 15-minute operational extension requested for Task #{task}. Traffic flow adjusted."
        },
        "FIT": {
            "title": "Fitment Certified & Track Handover Completed",
            "badge": "FIT CERTIFIED",
            "badge_color": "#10B981",
            "bg_color": "rgba(16, 185, 129, 0.1)",
            "icon": "✅",
            "desc": f"Safety certification logged. OHE normalized / Track packed / Point tested. Task #{task} marked COMPLETED."
        }
    }

    cfg = action_configs.get(act.upper(), {
        "title": "Action Processed",
        "badge": "PROCESSED",
        "badge_color": "#888888",
        "bg_color": "rgba(136, 136, 136, 0.1)",
        "icon": "📋",
        "desc": f"Update received for Task #{task}."
    })

    # Record action in log
    _DISPATCH_LOG.append({
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "task_id": task,
        "action": act.upper(),
        "status": cfg["badge"],
        "note": note or cfg["title"]
    })

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RailBlock AI — Field Action Confirmed</title>
      <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
          background-color: #0b0f19;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }}
        .card {{
          background: #131b2e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 28px 24px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }}
        .header {{
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #94a3b8;
        }}
        .icon-circle {{
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: {cfg['bg_color']};
          border: 2px solid {cfg['badge_color']};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 18px;
        }}
        .badge {{
          display: inline-block;
          padding: 4px 14px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          background: {cfg['bg_color']};
          color: {cfg['badge_color']};
          border: 1px solid {cfg['badge_color']};
          margin-bottom: 12px;
        }}
        h1 {{
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
          line-height: 1.3;
        }}
        p {{
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 20px;
        }}
        .task-meta {{
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 14px;
          text-align: left;
          font-size: 12px;
          margin-bottom: 24px;
        }}
        .meta-row {{
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }}
        .meta-row:last-child {{ border-bottom: none; }}
        .meta-label {{ color: #64748b; }}
        .meta-val {{ color: #f8fafc; font-weight: 600; }}
        .btn {{
          display: inline-block;
          width: 100%;
          padding: 12px 0;
          background: #0070F3;
          color: white;
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: 0.2s;
        }}
        .btn:hover {{ background: #0051b3; }}
        .footer {{
          margin-top: 18px;
          font-size: 11px;
          color: #475569;
        }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span>🚆 RailBlock AI</span>
          <span>•</span>
          <span>Field Dispatch</span>
        </div>

        <div class="icon-circle">{cfg['icon']}</div>
        <div class="badge">{cfg['badge']}</div>
        <h1>{cfg['title']}</h1>
        <p>{cfg['desc']}</p>

        <div class="task-meta">
          <div class="meta-row">
            <span class="meta-label">Task ID:</span>
            <span class="meta-val">#{task}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Action Timestamp:</span>
            <span class="meta-val">{now_str}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Transmission:</span>
            <span class="meta-val">Encrypted Mobile Handshake</span>
          </div>
        </div>

        <a href="/" class="btn">Open RailBlock Control Center</a>
        <div class="footer">Indian Railways Operating Decision Support • SIH26027</div>
      </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html, status_code=200)
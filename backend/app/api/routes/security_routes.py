"""
RailBlock AI — Cryptographic Security & Safety Seal Endpoints (SIH26027)
========================================================================
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.core.security import (
    create_access_token,
    verify_access_token,
    generate_permit_seal,
    verify_permit_seal,
    encrypt_sensitive_field,
    decrypt_sensitive_field,
    get_current_user,
    require_admin
)
from app.core.config import settings

router = APIRouter(prefix="/security", tags=["Security & Cryptography"])


class TokenRequest(BaseModel):
    username: str = "controller.mumbai"
    role: str = "ADMIN"  # "ADMIN", "SECTION_CONTROLLER", "STATION_MASTER", "COMMUTER_VIEWER"
    division: str = "Mumbai Suburban Division"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    issued_to: str
    expires_in_hours: int = 24
    cryptographic_algorithm: str = "HMAC-SHA256"


class SealPermitRequest(BaseModel):
    task_id: str
    corridor: str
    supervisor: str
    issued_at: Optional[str] = None


class SealPermitResponse(BaseModel):
    task_id: str
    corridor: str
    supervisor: str
    issued_at: str
    cryptographic_seal: str
    verification_hash: str
    is_tamper_evident: bool = True
    status: str = "AUTHENTICATED"


class VerifySealRequest(BaseModel):
    cryptographic_seal: str
    task_id: str
    corridor: str
    supervisor: str
    issued_at: str


class VerifySealResponse(BaseModel):
    is_valid: bool
    status: str
    detail: str
    verified_by: str = "RailBlock-AI-Cryptographic-Engine"


@router.post("/token", response_model=TokenResponse, summary="Issue Cryptographic JWT Access Token")
def issue_session_token(req: TokenRequest):
    """
    Issues a cryptographically signed HMAC-SHA256 session token with embedded role claims.
    """
    token_data = {
        "sub": req.username,
        "role": req.role,
        "division": req.division
    }
    token = create_access_token(token_data)
    return TokenResponse(
        access_token=token,
        role=req.role,
        issued_to=req.username,
        cryptographic_algorithm=settings.ALGORITHM
    )


@router.post("/seal-permit", response_model=SealPermitResponse, summary="Generate Cryptographic Safety Seal for Track Permit")
def seal_work_permit(req: SealPermitRequest, current_user=Depends(require_admin)):
    """
    Generates an HMAC-SHA256 tamper-evident digital seal for a Track Fit Certificate
    or TRD 25kV Power Block Permit. Ensures zero field permit forgery.
    """
    from datetime import datetime, timezone
    issued_at = req.issued_at or datetime.now(timezone.utc).strftime("%d-%b-%Y %H:%M:%S UTC")
    seal = generate_permit_seal(req.task_id, req.corridor, req.supervisor, issued_at)
    
    return SealPermitResponse(
        task_id=req.task_id,
        corridor=req.corridor,
        supervisor=req.supervisor,
        issued_at=issued_at,
        cryptographic_seal=seal,
        verification_hash=f"HMAC-SHA256:{seal}",
        is_tamper_evident=True,
        status="AUTHENTICATED"
    )


@router.post("/verify-seal", response_model=VerifySealResponse, summary="Verify Authenticity of Work Permit Seal")
def verify_safety_seal(req: VerifySealRequest):
    """
    Cryptographically verifies whether a field work permit seal has been tampered with.
    """
    is_authentic = verify_permit_seal(
        seal=req.cryptographic_seal,
        task_id=req.task_id,
        corridor=req.corridor,
        supervisor=req.supervisor,
        issued_at=req.issued_at
    )
    
    if is_authentic:
        return VerifySealResponse(
            is_valid=True,
            status="VERIFIED_AUTHENTIC",
            detail="Digital seal matches cryptographic signature. Permit is authentic and un-tampered."
        )
    else:
        return VerifySealResponse(
            is_valid=False,
            status="TAMPER_DETECTED",
            detail="WARNING: Seal checksum mismatch! Permit parameters or timestamps have been modified."
        )


@router.get("/status", summary="Security & Cryptographic Subsystem Health")
def get_security_status(current_user=Depends(get_current_user)):
    """
    Returns security diagnostics, active cryptographic cipher suites, and authentication state.
    """
    return {
        "status": "OPERATIONAL",
        "cipher_suite": "HMAC-SHA256 + PBKDF2 Envelope",
        "token_algorithm": settings.ALGORITHM,
        "token_validity_hours": settings.ACCESS_TOKEN_EXPIRE_MINUTES // 60,
        "active_user": current_user.get("sub"),
        "role": current_user.get("role"),
        "tamper_evidence": "ACTIVE",
        "field_level_encryption": "ENABLED"
    }


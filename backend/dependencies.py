from fastapi import Header, HTTPException, status

from auth import decode_token


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    try:
        parts = authorization.split(" ")

        if len(parts) != 2 or parts[0] != "Bearer":
            raise ValueError("Invalid authorization header")

        token = parts[1]
        user = decode_token(token)

        if user.get("token_type") != "access":
            raise ValueError("Refresh token cannot authorize requests")

        return user

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc

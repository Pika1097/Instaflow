from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class CampaignCreateRequest(BaseModel):
    keyword: str = Field(min_length=2, max_length=160)
    message: str = Field(min_length=3, max_length=1000)
    priority: int = Field(default=1, ge=1, le=10)
    start_hour: Optional[int] = Field(default=None, ge=0, le=23)
    end_hour: Optional[int] = Field(default=None, ge=0, le=23)
    min_words: Optional[int] = Field(default=0, ge=0, le=200)

    @model_validator(mode="after")
    def normalize_text(self):
        self.keyword = self.keyword.strip()
        self.message = self.message.strip()

        if not self.keyword or not self.message:
            raise ValueError("Keyword and message are required")

        return self


class CampaignUpdateRequest(BaseModel):
    keyword: Optional[str] = Field(default=None, min_length=2, max_length=160)
    message: Optional[str] = Field(default=None, min_length=3, max_length=1000)
    priority: Optional[int] = Field(default=None, ge=1, le=10)
    start_hour: Optional[int] = Field(default=None, ge=0, le=23)
    end_hour: Optional[int] = Field(default=None, ge=0, le=23)
    min_words: Optional[int] = Field(default=None, ge=0, le=200)

    @model_validator(mode="after")
    def normalize_text(self):
        if self.keyword is not None:
            self.keyword = self.keyword.strip()

        if self.message is not None:
            self.message = self.message.strip()

        if self.keyword == "" or self.message == "":
            raise ValueError("Keyword and message cannot be empty")

        return self


class CommentTestRequest(BaseModel):
    comment: str = Field(min_length=1, max_length=1000)

    @model_validator(mode="after")
    def normalize_comment(self):
        self.comment = self.comment.strip()

        if not self.comment:
            raise ValueError("Comment cannot be empty")

        return self

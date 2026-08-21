from __future__ import annotations

import base64

from app.config import Settings

BCRYPT_HASH = "$2b$12$m.XEVwsQHGNz3GjNItn2WuIlJbay3aTncZV7WjI01nbKAjTzdJTpy"


def _settings(**overrides):
    return Settings(database_url="postgresql+psycopg://x:x@localhost/x", **overrides)


def test_admin_password_hash_accepts_raw_bcrypt():
    settings = _settings(admin_password_hash=BCRYPT_HASH)
    assert settings.admin_password_hash == BCRYPT_HASH


def test_admin_password_hash_decodes_base64():
    encoded = base64.b64encode(BCRYPT_HASH.encode()).decode()
    settings = _settings(admin_password_hash=encoded)
    assert settings.admin_password_hash == BCRYPT_HASH


def test_admin_password_hash_keeps_garbage_as_is():
    settings = _settings(admin_password_hash="not-a-hash-not-base64-either!!")
    assert settings.admin_password_hash == "not-a-hash-not-base64-either!!"


def test_admin_password_hash_empty_stays_empty():
    settings = _settings(admin_password_hash="")
    assert settings.admin_password_hash == ""


def test_followup_business_days_empty_string_falls_back_to_default():
    settings = _settings(followup_business_days="")
    assert settings.followup_business_days == 2


def test_followup_business_days_respects_explicit_value():
    settings = _settings(followup_business_days="5")
    assert settings.followup_business_days == 5


def test_rate_limit_per_hour_empty_string_falls_back_to_default():
    settings = _settings(rate_limit_per_hour="")
    assert settings.rate_limit_per_hour == 20

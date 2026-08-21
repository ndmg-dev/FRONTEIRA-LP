from __future__ import annotations

import re

from app.services.protocol import generate_protocol

PROTOCOL_RE = re.compile(r"^FRT-\d{4}-[0-9A-HJ-KM-NP-TV-Z]{6}$")


def test_protocol_format():
    protocol = generate_protocol(year=2026)
    assert protocol.startswith("FRT-2026-")
    assert PROTOCOL_RE.match(protocol)


def test_protocol_alphabet_excludes_ambiguous_chars():
    for _ in range(200):
        protocol = generate_protocol()
        suffix = protocol.split("-")[2]
        assert not set(suffix) & set("ILOU")


def test_protocol_is_effectively_unique_across_many_calls():
    protocols = {generate_protocol() for _ in range(500)}
    assert len(protocols) == 500

"""
Every detector across the engine builds its findings through this one
function so the shape is always exactly what the API schema (and the
frontend) expects: observed evidence, kept separate from the heuristic
interpretation of it.
"""

from typing import TypedDict


class Finding(TypedDict):
    type: str
    severity: str  # 'low' | 'medium' | 'high'
    title: str
    description: str
    evidence: str


def make_finding(type: str, severity: str, title: str, description: str, evidence: str) -> Finding:
    return {
        "type": type,
        "severity": severity,
        "title": title,
        "description": description,
        "evidence": evidence,
    }

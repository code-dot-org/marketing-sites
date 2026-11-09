"""State of Digital Fluency data pipeline (proof of concept).

Reads the Advocacy team's Google Sheet with read-only credentials, runs a
placeholder transform, validates the result against a repo-owned JSON Schema,
and writes it into a single Contentful envelope entry as a draft.

The marketing site never talks to Google. It only reads the Contentful entry.
"""

__all__ = ["__version__"]

__version__ = "0.1.0"

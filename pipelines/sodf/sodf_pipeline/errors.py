"""Error types the CLI turns into a clean, non-zero exit with a readable message."""


class PipelineError(Exception):
    """A failure the operator can act on (bad config, sheet drift, invalid data)."""

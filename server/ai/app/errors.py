class PermanentProcessingError(Exception):
    """A job cannot succeed when retried with the same input."""


class RemoteResourceMissingError(PermanentProcessingError):
    """The corresponding Node resource was deleted while processing."""


class EventDeletedError(PermanentProcessingError):
    """The event was deleted and its work should be discarded."""

from enum import Enum
from typing import Callable, Optional
import logging

logger = logging.getLogger(__name__)


class AgentState(Enum):
    IDLE = "IDLE"
    LISTENING = "LISTENING"
    PROCESSING = "PROCESSING"
    SPEAKING = "SPEAKING"
    INTERRUPTED = "INTERRUPTED"


# Legal transitions - enforces the state machine
VALID_TRANSITIONS: dict[AgentState, set[AgentState]] = {
    AgentState.IDLE:        {AgentState.LISTENING},
    AgentState.LISTENING:   {AgentState.PROCESSING, AgentState.IDLE},
    AgentState.PROCESSING:  {AgentState.SPEAKING, AgentState.LISTENING, AgentState.IDLE},
    AgentState.SPEAKING:    {AgentState.LISTENING, AgentState.INTERRUPTED, AgentState.IDLE},
    AgentState.INTERRUPTED: {AgentState.LISTENING, AgentState.IDLE},
}


class StateMachine:
    def __init__(self):
        self.state = AgentState.IDLE
        self._on_change: Optional[Callable] = None

    def on_change(self, callback: Callable):
        self._on_change = callback

    def transition(self, new_state: AgentState) -> bool:
        """Attempt a legal transition. Returns False if not valid."""
        if new_state in VALID_TRANSITIONS.get(self.state, set()):
            self._do_transition(new_state)
            return True
        logger.warning(f"Illegal transition: {self.state.value} → {new_state.value}")
        return False

    def force(self, new_state: AgentState):
        """Force a state change regardless of validity (for recovery paths)."""
        self._do_transition(new_state)

    def _do_transition(self, new_state: AgentState):
        old = self.state
        self.state = new_state
        logger.info(f"State: {old.value} → {new_state.value}")
        if self._on_change:
            self._on_change(old, new_state)

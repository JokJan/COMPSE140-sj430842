# Enum containing the possible states for the system, stored in a separate file for readability
from enum import Enum

class States(str, Enum):
    Initial = "INIT"
    Paused = "PAUSED"
    Running = "RUNNING"
    Shutdown = "SHUTDOWN"
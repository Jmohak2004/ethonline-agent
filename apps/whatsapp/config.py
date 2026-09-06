"""
AgentFi WhatsApp Service — Config
Re-exports the centralized application settings to prevent namespace collisions and missing attributes.
"""
import os
import sys
import importlib.util

_api_config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../api/config.py"))
_spec = importlib.util.spec_from_file_location("apps_api_config", _api_config_path)
_api_config_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_api_config_mod)

Settings = _api_config_mod.Settings
settings = _api_config_mod.settings


# Metaflow Extension Development Guide

This guide covers how to build custom extensions for Metaflow using the extension mechanism. Extensions allow you to add new datastores, environments, metadata providers, decorators, and other components without modifying core Metaflow code.

## Overview

Metaflow's extension system uses a plugin-based architecture that automatically discovers and loads third-party packages. Extensions are discovered through the `metaflow_extensions` package namespace and loaded at runtime via extension points.

### Key Concepts

- **Extension Package**: A Python package named `metaflow_extensions` that contains extension modules
- **Extension Point**: A hook in Metaflow's initialization where extensions are registered (e.g., `toplevel`, `datastore`, `environment`)
- **Lazy Loading**: Modules are imported only when needed to reduce startup overhead
- **Module Aliases**: Extensions can expose submodules as top-level Metaflow attributes

## Creating a Basic Extension

### Step 1: Package Structure

Create a package structure for your extension:

```
my_metaflow_extension/
├── metaflow_extensions/
│   └── my_extension/
│       ├── __init__.py
│       ├── datastore.py        # Optional: Custom datastore
│       ├── environment.py       # Optional: Custom environment
│       └── toplevel.py          # Optional: Top-level exports
└── setup.py
```

### Step 2: Define Extension Metadata

In `metaflow_extensions/my_extension/__init__.py`, declare what extension points your package provides:

```python
# metaflow_extensions/my_extension/__init__.py

# Required: Declare which extension points this package provides
EXTENSION_TYPES = {
    'toplevel': True,           # Provides top-level exports
    'datastore': True,          # Provides datastores
    'environment': False,       # Does not provide environments
}

# Optional: Version and metadata
__version__ = '1.0.0'
__extension_name__ = 'My Custom Extension'
```

### Step 3: Implement Extension Points

#### 3.1 Top-Level Exports (toplevel.py)

To expose custom classes/functions at the Metaflow top level:

```python
# metaflow_extensions/my_extension/toplevel.py

class MyCustomDecorator:
    """A custom decorator for special use cases"""
    pass

class MyUtility:
    """A utility class"""
    pass

# This tells Metaflow to expose these at the top level
__mf_promote_submodules__ = ["MyCustomDecorator", "MyUtility"]
```

After installation, users can access:
```python
from metaflow import MyCustomDecorator, MyUtility
```

#### 3.2 Custom Datastore (datastore.py)

Create a custom datastore for alternative storage backends:

```python
# metaflow_extensions/my_extension/datastore.py

from metaflow.plugins.datastores.base_datastore import Datastore

class MyDatastore(Datastore):
    TYPE = 'my_datastore'
    
    def __init__(self, config=None):
        super().__init__(config)
        # Initialize your datastore
        pass
    
    def get_datastore_root(self):
        # Return the root path/location for this datastore
        pass
    
    def upload_artifact(self, artifact_id, data):
        # Implement upload logic
        pass
    
    def download_artifact(self, artifact_id):
        # Implement download logic
        pass
    
    # Implement other abstract methods as required
    ...

# Register the datastore
EXTENSION_DATASTORE = MyDatastore
```

Then users can select your datastore with:
```bash
metaflow run --datastore my_datastore
```

#### 3.3 Custom Environment (environment.py)

Create a custom execution environment:

```python
# metaflow_extensions/my_extension/environment.py

from metaflow.metaflow_environment import MetaflowEnvironment

class MyEnvironment(MetaflowEnvironment):
    TYPE = 'my_environment'
    
    def init(self):
        # Initialize environment-specific setup
        pass
    
    def bootstrap(self):
        # Bootstrap the environment (e.g., Docker setup)
        pass
    
    def get_launch_command(self, *args):
        # Return command to launch tasks in this environment
        pass
    
    # Implement other abstract methods as required
    ...

# Register the environment
EXTENSION_ENVIRONMENT = MyEnvironment
```

Users can then run flows in your custom environment:
```bash
metaflow run --environment my_environment
```

## Advanced: Custom Decorators

To add custom decorators that integrate with Metaflow's decorator system:

```python
# metaflow_extensions/my_extension/decorators.py

from metaflow.decorators import StepDecorator

class my_decorator(StepDecorator):
    """
    A custom decorator for specialized task execution.
    
    Parameters
    ----------
    timeout : int
        Maximum execution time in seconds
    """
    
    name = 'my_decorator'
    defaults = {'timeout': 3600}
    
    def init(self):
        # Validate and parse decorator attributes
        pass
    
    def step_init(self, flow, graph, step_name, decorators, environment, 
                  flow_datastore, logger):
        # Called when decorators are initialized for a step
        pass
    
    def task_post_run(self, task):
        # Called after task execution
        pass

# Register with Metaflow
EXTENSION_DECORATOR = my_decorator
```

## Installation & Registration

### setup.py Configuration

In your extension's `setup.py`:

```python
from setuptools import setup

setup(
    name='my-metaflow-extension',
    version='1.0.0',
    packages=['metaflow_extensions.my_extension'],
    install_requires=['metaflow>=2.0.0'],
    entry_points={
        'metaflow_extensions': [
            'my_extension = metaflow_extensions.my_extension',
        ]
    },
)
```

### Installation

```bash
pip install -e .
```

### Environment Variable Discovery

If you want Metaflow to search additional directories for extensions:

```bash
export METAFLOW_EXTENSIONS_SEARCH_DIRS=/path/to/extensions:/another/path
python -m metaflow run my_flow.py
```

## Best Practices

### 1. Error Handling
Always handle initialization errors gracefully:

```python
try:
    from metaflow.plugins.datastores.base_datastore import Datastore
except ImportError:
    Datastore = object  # Fallback for older versions
```

### 2. Configuration
Use Metaflow's configuration system for extension settings:

```python
from metaflow.metaflow_config import from_conf

class MyDatastore(Datastore):
    def __init__(self):
        self.url = from_conf('MY_EXTENSION_URL', 'http://localhost:8080')
```

### 3. Logging
Use the standard logging module:

```python
import logging
logger = logging.getLogger(__name__)
logger.info(f"Initializing {self.TYPE} datastore")
```

### 4. Testing
Extend the standard Metaflow test framework:

```python
# test_my_extension.py
from metaflow.test import TestMetaflow

class TestMyExtension(TestMetaflow):
    def test_custom_datastore(self):
        @datastore('my_datastore')
        class MyFlow(FlowSpec):
            pass
        # Run flow and verify
```

### 5. Documentation
Document your extension with:
- Clear usage examples
- Configuration options
- Known limitations
- Performance characteristics

## Environment Setup for Extension Development

1. **Install development dependencies**:
   ```bash
   pip install -e ".[dev]"
   pip install pytest pytest-cov mypy
   ```

2. **Type checking**:
   ```bash
   mypy metaflow_extensions/
   ```

3. **Testing**:
   ```bash
   pytest tests/
   ```

4. **Linting**:
   ```bash
   pylint metaflow_extensions/
   ```

## Troubleshooting

### Extension Not Discovered

Check if your package is properly installed:
```python
import metaflow_extensions
print(dir(metaflow_extensions))  # Should show your extension
```

### Import Errors

Enable debug logging to see extension loading details:
```bash
export METAFLOW_DEBUG_EXT=1
python -m metaflow run my_flow.py -v
```

### Lazy Loading Issues

If your extension uses lazy imports, ensure all imports are properly qualified:
```python
# Good
from metaflow.plugins import datastore

# Avoid
from metaflow.plugins.datastore import *
```

## Examples

See the Metaflow repository for examples of built-in extensions:
- `metaflow/plugins/datastores/` - Datastore implementations
- `metaflow/plugins/env_escape/` - Environment escape configurations
- Built-in decorators in `metaflow/plugins/` directory

## References

- [Extension Support API](./extension-support.md)
- [Metaflow Configuration](./metaflow-config.md)
- [Decorator Development](./decorators.md)

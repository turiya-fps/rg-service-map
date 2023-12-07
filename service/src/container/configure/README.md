# Container Configuration

The container is configured in a sequential manner, each layer being aware of its parent.

1. Parameters & Environment
2. Base Services & Helpers
3. Database
4. Domain

Beyond this there is a container configuration at the route of each `/handler/*` directory.
This will configure the handlers (if required) or any specific ingress helpers.

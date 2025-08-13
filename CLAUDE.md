# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

NomadVibe is a Claude Code configuration repository containing specialized agents and commands designed for comprehensive software development workflows. This repository serves as a productivity toolkit with pre-configured agents for various technical domains and automated development commands.

## Repository Structure

### Custom Agents (.claude/agents/)
Specialized AI agents for different technical domains:

- **backend-architect**: RESTful API design, microservices architecture, database schema design
- **frontend-developer**: React development, responsive layouts, client-side optimization
- **quant-analyst**: Financial modeling, trading strategies, risk analysis (uses Opus model)
- **code-reviewer**: Code quality review and security analysis
- **debugger**: Error resolution and troubleshooting
- **error-detective**: Log analysis and error pattern detection
- **search-specialist**: Advanced research and information gathering
- **devops-troubleshooter**: Production debugging and system analysis
- **mcp-expert**: Model Context Protocol integration development
- **mcp-deployment-orchestrator**: Production deployment and scaling for MCP servers
- **agent-expert**: Creating and designing new specialized agents
- **task-decomposition-expert**: Breaking down complex tasks into actionable components

### Custom Commands (.claude/commands/)
Automated development workflow commands:

- **write-tests**: Comprehensive testing strategy with framework detection and systematic test implementation
- **create-pr**: Automated branch creation, formatting with Biome, intelligent commit splitting, and PR creation
- **ci-setup**: Complete CI/CD pipeline setup with security scanning and multi-environment deployment
- **commit**: Intelligent commit message generation and staging
- **test-coverage**: Test coverage analysis and reporting

## Development Workflow

### Testing Strategy
Use `/write-tests` command for systematic test implementation:
- Automatic testing framework detection (Jest, PyTest, RSpec)
- Comprehensive coverage including unit, integration, and E2E tests
- Follows AAA pattern (Arrange, Act, Assert)
- Includes security, accessibility, and performance testing guidelines

### Pull Request Workflow
Use `/create-pr` command for streamlined PR creation:
- Automatic code formatting with Biome
- Intelligent commit splitting by logical changes
- Automatic branch creation and remote push
- Generated PR summaries with test plans

### CI/CD Setup
Use `/ci-setup` command for complete pipeline configuration:
- Multi-platform CI/CD support (GitHub Actions, GitLab CI, Jenkins)
- Automated testing, security scanning, and deployment
- Multi-environment deployment with approval workflows
- Performance testing and monitoring integration

## Agent Usage Patterns

### Proactive Agent Usage
Several agents are designed for proactive use:
- **backend-architect**: Use when creating new APIs or services
- **frontend-developer**: Use when building UI components
- **code-reviewer**: Use after significant code changes
- **architect-reviewer**: Use after structural changes
- **devops-troubleshooter**: Use for production issues
- **quant-analyst**: Use for financial modeling tasks

### Specialized Domain Agents
- **quant-analyst**: Financial modeling with pandas, numpy, scipy
  - Trading strategy backtesting
  - Risk metrics calculation (VaR, Sharpe ratio)
  - Portfolio optimization
  - Statistical arbitrage implementation

- **mcp-expert**: Model Context Protocol development
  - MCP server configurations
  - Protocol specifications
  - Integration patterns

- **mcp-deployment-orchestrator**: Production MCP deployment
  - Kubernetes deployment configuration
  - Docker containerization
  - Autoscaling and monitoring setup
  - Security hardening

## Key Features

### Intelligent Task Management
- **task-decomposition-expert**: Breaks complex goals into actionable tasks
- Identifies optimal tool and agent combinations
- Manages multi-component system development

### Code Quality and Security
- **code-reviewer**: Security-focused code analysis
- **error-detective**: Advanced log analysis and debugging
- Automated security scanning in CI/CD pipelines
- Dependency vulnerability management

### Research and Analysis
- **search-specialist**: Advanced web research capabilities
- Multi-source verification and fact-checking
- Competitive analysis and trend identification

## Architecture Principles

### Agent Design Philosophy
- Clear domain expertise boundaries
- Concrete, actionable outputs over theory
- Practical implementation focus
- Proactive usage for domain-specific tasks

### Development Best Practices
- Contract-first API design
- Horizontal scaling considerations
- Risk-adjusted returns in financial modeling
- Robust backtesting with realistic assumptions
- Security-first approach in all implementations

This repository serves as a comprehensive development toolkit, enabling rapid deployment of specialized AI assistance across the full software development lifecycle.
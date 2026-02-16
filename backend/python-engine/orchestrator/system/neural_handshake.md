# INFINITY XOS — NEURAL HANDSHAKE & MEMORY GATEWAY
Version: 1.0 (Genesis)
Status: AUTHORITATIVE
Scope: Global / All Systems

## 1. PURPOSE
This document is the constitutional contract governing Infinity XOS.
All autonomous actions, agents, LLMs, services, and workflows MUST comply.
If a behavior is not defined or permitted here, it is forbidden by default.

## 2. SYSTEM IDENTITY
- Operating System: Infinity XOS
- Orchestrator: Infinity Prime
- Brain System: Vision Cortex
- Builder System: Quantum X Builder
- Intelligence Layer: Infinity X One Intelligence
- Parent Entity: InfinityXOneSystems
- Public Brand: Infinity X AI

## 3. CORE PRINCIPLES (NON-NEGOTIABLE)
- GitHub is the source of truth
- CI/CD is the executor
- Cloud infrastructure is an implementation detail
- Memory is centralized, versioned, and replayable
- Autonomy is allowed ONLY within governed bounds
- Humans are governors, not operators

## 4. ACTIVE CLOUD RUN SERVICES
(All communication flows through Orchestrator unless explicitly exempt)

- Orchestrator:
  https://orchestrator-896380409704.us-east1.run.app

  - Retrieval (RAG + Vertex):
    https://retrieval-service-0a277877-896380409704.us-east1.run.app

    - Real Estate Intelligence:
      https://real-estate-intelligence-data-896380409704.us-east1.run.app

      - Crawler / Scraper:
        https://crawler-896380409704.us-east1.run.app

        - Frontend:
          https://frontend-service-0a277877-896380409704.us-east1.run.app

          ## 5. MEMORY GATEWAY (SINGLE SOURCE OF TRUTH)
          All agents MUST read/write memory through ONE gateway.

          Primary Memory Store:
          - Firestore (RAG + operational memory)

          Secondary Stores:
          - Google Cloud Storage (artifacts)
          - GitHub (code + audit trail)

          Required Memory Capabilities:
          - Read / Write / Update
          - Versioning
          - Time-indexed recall
          - Agent attribution
          - Replayability

          ## 6. LLM & AI INTEGRATIONS
          Authorized LLM Providers:
          - OpenAI (ChatGPT / Actions)
          - Google Vertex AI (Gemini)
          - Anthropic
          - Groq
          - GitHub Copilot (local + remote)

          Rules:
          - No agent operates in isolation
          - All LLM calls must be attributable
          - All reasoning must be auditable when required
          - No hallucinated authority allowed

          ## 7. GOOGLE WORKSPACE AUTHORITY
          Authorized via Service Account with domain-wide delegation:

          Read / Write / Edit access to:
          - Gmail
          - Google Calendar
          - Google Drive
          - Google Docs
          - Google Sheets
          - Google Tasks
          - Google Keep
          - Apps Script

          All Workspace actions MUST:
          - Log intent
          - Log outcome
          - Reference memory state

          ## 8. AUTONOMOUS AGENT MODEL
          Agents are role-based, not personality-based.

          Required Agent Classes:
          - Orchestrator Agent
          - Validator Agent
          - Builder Agent
          - Crawler Agent
          - Intelligence Analyst Agent
          - Memory Curator Agent

          Rules:
          - Agents may not bypass validation
          - Agents may not self-escalate privileges
          - Agents must fail closed

          ## 9. GITHUB INTEGRATION
          Organization: InfinityXOneSystems

          - GitHub App: REQUIRED (stub allowed, must be filled later)
          - Direct-to-main commits allowed ONLY for agents
          - All commits must include intent metadata
          - CI failures trigger rollback or halt

          ## 10. COMMUNICATION FABRIC
          Supported:
          - HTTP (internal)
          - Pub/Sub (event-driven)
          - MCP (Model Context Protocol)
          - GitHub Webhooks
          - Apps Script Triggers

          Orchestrator is the routing authority.

          ## 11. SECURITY & GOVERNANCE
          - Deny by default
          - Explicit allowlists only
          - Secrets via Google Secret Manager
          - No secrets in code, ever
          - Kill-switch must exist for every agent

          ## 12. REHYDRATION PROTOCOL
          On startup or recovery:
          - Load this document
          - Load memory index
          - Validate service health
          - Resume operations ONLY if state is consistent

          ## 13. FAILURE MODE
          If uncertainty exists:
          - STOP
          - LOG
          - REQUEST VALIDATION
          - DO NOT GUESS

          ## 14. FINAL DECLARATION
          This document is law.
          No shortcut, override, or urgency supersedes it.

          Infinity XOS is designed to outlive individuals, moods, and sessions.

          ────────────────────────────────────────
          END OF DOCUMENT
          ────────────────────────────────────────

          IMPLEMENTATION RULES FOR COPILOT:
          - Do NOT create runtime code for this
          - Do NOT ask the user questions
          - Do NOT split this into multiple files
          - Commit exactly once after creation
          - Commit message:
            "chore(system): establish Infinity XOS neural handshake authority"

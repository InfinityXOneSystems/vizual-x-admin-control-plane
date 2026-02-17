
# VIZUAL X | MONACO SUPREME

This repository contains the full monorepo for the Vizual X Autonomous Development Control Plane, a deterministic enterprise AI compiler built with React, Node.js, and Google GenAI.

## System Architecture

- **Frontend**: A React-based UI featuring a Monaco editor, admin dashboard, and multi-modal creation tools.
- **Backend**: A Node.js/Express API providing REST endpoints for all system functions, with persistence via a local JSON file.
- **Infrastructure**: Defined via Terraform for deployment to Google Cloud Platform.
- **Containerization**: A multi-service Docker Compose setup for a consistent local development environment.
- **CI/CD**: A GitHub Actions workflow to validate, test, and build the system on every commit.

---

## Local Development Setup

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- [Node.js](https://nodejs.org/) v20.x or later
- An active Google GenAI API key

### Running Locally with Docker

This is the recommended method for local development as it mirrors the production environment.

1.  **Create Environment File**: Create a `.env` file in the root of the project and add your Google GenAI API key:
    ```
    API_KEY=your_google_genai_api_key_here
    ```
    The frontend will automatically have access to this key as `process.env.API_KEY`.

2.  **Build and Run Containers**:
    ```bash
    docker-compose up --build
    ```

3.  **Access Services**:
    - **Frontend**: `http://localhost:3000`
    - **Backend API**: `http://localhost:3001`

---

## Deployment to Google Cloud

### Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- [Terraform CLI](https://developer.hashicorp.com/terraform/downloads)
- A Google Cloud project with billing enabled
- Enabled APIs: Cloud Build, Cloud Run, Artifact Registry, Secret Manager, IAM

### Deployment Steps

1.  **Authenticate with GCP**:
    ```bash
    gcloud auth login
    gcloud config set project YOUR_PROJECT_ID
    ```

2.  **Store API Key in Secret Manager**:
    ```bash
    gcloud secrets create vix-api-key --replication-policy="automatic"
    echo -n "your_google_genai_api_key_here" | gcloud secrets versions add vix-api-key --data-file=-
    ```

3.  **Initialize Terraform**:
    Navigate to the `terraform` directory:
    ```bash
    cd terraform
    terraform init
    ```

4.  **Configure Terraform Variables**:
    Create a `terraform.tfvars` file in the `terraform/` directory:
    ```
    project_id = "your-gcp-project-id"
    region     = "your-gcp-region" # e.g., "us-central1"
    ```

5.  **Apply Terraform Plan**:
    ```bash
    terraform apply
    ```
    Review the plan and type `yes` to deploy the infrastructure. Terraform will build the container images using Cloud Build and deploy them to Cloud Run.

6.  **Access Deployed App**:
    The Terraform output will provide the URL for the deployed frontend service.

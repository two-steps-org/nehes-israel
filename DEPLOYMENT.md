# Deployment Guide: Nehes Israel

## Prerequisites

- Docker Hub account
- Render account (for backend)
- Vercel account (for frontend)
- GitHub repository admin access

## Manual Dockerhub upload commands for frontend and backend

Backend -

1. cd backend
2. docker build --platform linux/amd64 -t shaybush/nehes-backend:latest .
3. docker push shaybush/nehes-backend:latest

Frontend -

1. cd ../frontend
2. docker build --platform linux/amd64 -t shaybush/nehes-frontend:latest .
3. docker push shaybush/nehes-frontend:latest

---

## 1. Docker Hub Setup

1. Create a Docker Hub account: https://hub.docker.com/
2. Create a new repository for backend (e.g., `nehes-backend`) and frontend (e.g., `nehes-frontend`).
3. Generate a Docker Hub access token (Account Settings > Security > New Access Token).

---

## 2. Render Setup (Backend)

1. Create a new Web Service on Render: https://dashboard.render.com/
2. Choose "Deploy an existing image from a registry".
3. Use your Docker Hub image: `your-dockerhub-username/nehes-backend:latest`.
4. Note your Render Service ID (from the service settings or API docs).
5. Generate a Render API key (Account Settings > API Keys).

---

# TODO: use render for front end

## 3. Vercel Setup (Frontend)

1. Create a new project on Vercel: https://vercel.com/
2. Connect your GitHub repository or set up a project manually.
3. Get your Vercel Org ID and Project ID (see Vercel docs or use the Vercel CLI: `vercel projects ls`).
4. Generate a Vercel token: https://vercel.com/account/tokens

---

## 4. GitHub Secrets

Go to your GitHub repo > Settings > Secrets and variables > Actions, and add:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID
- `VERCEL_TOKEN`: Your Vercel personal access token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

---

## 5. Alerting

- The workflow sends an email alert when both backend and frontend are deployed.
- To receive email alerts, follow the instructions below.

### Email Notification Setup

To receive an email after successful deployment:

1. **Obtain SMTP credentials** for your email provider (e.g., Gmail, Outlook, company SMTP):

   - SMTP server address (e.g., `smtp.gmail.com`)
   - SMTP port (e.g., `465` for SSL or `587` for TLS)
   - SMTP username (your email address or login)
   - SMTP password (your email password or app password)
   - From address (the email address you want the notification to come from)

2. **Add the following secrets** to your GitHub repository (Settings > Secrets and variables > Actions):

   - `SMTP_SERVER`: Your SMTP server address
   - `SMTP_PORT`: Your SMTP port
   - `SMTP_USERNAME`: Your SMTP username
   - `SMTP_PASSWORD`: Your SMTP password or app password
   - `SMTP_FROM`: The email address to send from

3. **Recipient**: The workflow is configured to send to `shay.bushary@twosteps.ai`.

#### Example (Gmail):

- `SMTP_SERVER`: `smtp.gmail.com`
- `SMTP_PORT`: `465`
- `SMTP_USERNAME`: `youraddress@gmail.com`
- `SMTP_PASSWORD`: _App password (recommended, not your main password)_
- `SMTP_FROM`: `youraddress@gmail.com`

> **Note:** For Gmail, you must enable 2FA and create an App Password for SMTP access.

---

## 6. Troubleshooting

- Check GitHub Actions logs for errors.
- Ensure all secrets are set correctly.
- Make sure Docker images are public or Render/Vercel have access.
- For Render/Vercel API issues, check their respective dashboards and API docs.

---

## 7. Useful Links

- [Render API Docs](https://render.com/docs/api)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Hub Docs](https://docs.docker.com/docker-hub/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

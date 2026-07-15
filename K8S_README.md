# Kubernetes (K8s) Architecture & Deployment Guide

This guide explains how the decomposed microservices application is managed and orchestrated using Kubernetes. It breaks down the core K8s concepts used in this project and provides a detailed walkthrough of each manifest file in the `k8s/` directory.

---

## 🧭 What is Kubernetes & Why Use It?

Kubernetes is a container orchestration platform. While Docker runs individual containers on a single host, Kubernetes manages groups of containers, routes traffic between them, scales them up or down, and provides self-healing capabilities across a cluster of servers.

### Key K8s Concepts Used Here:
1. **Pods**: The smallest deployable units in K8s, containing one or more containers (in our case, each Pod runs one microservice container).
2. **Deployments**: Declarative instructions telling K8s how to run and update your Pods (e.g., "Run exactly 2 replicas of the frontend").
3. **Services**: Stable, persistent network endpoints (internal IPs or DNS names) that allow Pods to find and communicate with each other, even when Pods are deleted and recreated.
4. **ConfigMaps & Secrets**: Externalized configurations that inject environment variables (like DB host names or secrets) into container environments at runtime.
5. **Ingress**: An API object that manages external access to the services in a cluster, typically HTTP routing, acting as our external API Gateway.

---

## 🛠️ Kubernetes Manifest Breakdown

All manifests are stored in the `/k8s` directory.

```
[ External Traffic ] ---> [ Ingress (ingress.yaml) ]
                                |
         +----------------------+----------------------+
         | (/)                  | (/api/auth)          | (/api/lemf)
         v                      v                      v
[ frontend Service ]   [ auth-service Service ]  [ lemf-service Service ]
         |                      |                      |
[ frontend Pods ]      [ auth-service Pods ]     [ lemf-service Pods ]
         |                      |                      |
         +----------------------+----------------------+
                                v
                       [ mysql Service ]
                                |
                        [ mysql Pod ]
```

### 1. Configuration: [k8s/config.yaml](./k8s/config.yaml)
- **Object Type**: `ConfigMap`
- **Purpose**: Defines shared environment variables used by the microservices (database hosts, ports, users, and JWT secrets).
- **Why**: Keeps variables externalized. If the database host shifts, we only update this file and reload the cluster; we do not need to rebuild the Docker images.

### 2. Database: [k8s/mysql.yaml](./k8s/mysql.yaml)
- **Object Type**: `Deployment` + `Service`
- **Purpose**: Provisions the MySQL database pod and exposes it on port `3306` inside the cluster.
- **Key Details**:
  - Uses the official `mysql:8.0` image.
  - The Service is named `mysql`, allowing other microservices in the cluster to connect to it simply using the DNS name `mysql:3306`.
  - *Note: In a production cluster, you would replace this with a `StatefulSet` and a `PersistentVolumeClaim` (PVC) so database data is not lost if the pod restarts.*

### 3. Auth Microservice: [k8s/auth-service.yaml](./k8s/auth-service.yaml)
- **Object Type**: `Deployment` + `Service`
- **Purpose**: Deploys the authentication microservice and exposes it internally.
- **Key Details**:
  - `envFrom`: Imports all environment variables from our `app-config` ConfigMap.
  - `env`: Explicitly overrides `DB_NAME` to point to the dedicated `auth_db`.
  - `Service`: Creates a `ClusterIP` Service exposing port `8080`. This makes the Auth Service reachable internally at `http://auth-service:8080`.

### 4. LEMF Microservice: [k8s/lemf-service.yaml](./k8s/lemf-service.yaml)
- **Object Type**: `Deployment` + `Service`
- **Purpose**: Deploys the LEMF records CRUD microservice.
- **Key Details**:
  - Shares the same environment config block as the Auth Service.
  - Explicitly sets `DB_NAME` to `lemf_db`.
  - Service makes the endpoint reachable internally at `http://lemf-service:8080`.

### 5. Frontend Client: [k8s/frontend.yaml](./k8s/frontend.yaml)
- **Object Type**: `Deployment` + `Service`
- **Purpose**: Deploys the NGINX frontend container containing the compiled React SPA.
- **Key Details**:
  - Exposes port `80` internally via its Service.
  - Unlike Docker Compose where NGINX proxied the APIs directly, in K8s, NGINX simply serves the static files. The cluster-wide Ingress controller handles the API routing.

### 6. Edge Router / API Gateway: [k8s/ingress.yaml](./k8s/ingress.yaml)
- **Object Type**: `Ingress`
- **Purpose**: The entry point for all external traffic hitting the cluster.
- **Key Routing Configurations**:
  - `/api/auth(.*)` -> Routed to `auth-service` Service on port `8080`.
  - `/api/lemf(.*)` -> Routed to `lemf-service` Service on port `8080`.
  - `/` (fallback) -> Routed to the `frontend` Service on port `80`.
- **Rewrite Rule**: The annotation `nginx.ingress.kubernetes.io/rewrite-target: /$2` allows the ingress controller to strip context prefixes if necessary, or pass requests down to sub-paths cleanly.

---

## 🚀 Running & Managing the Cluster Locally

You can test these configs locally using a lightweight Kubernetes tool like **Minikube**.

### 1. Start Minikube & Enable Ingress
Minikube needs the Ingress addon enabled to process the `ingress.yaml` file:
```bash
minikube start
minikube addons enable ingress
```

### 2. Point Docker CLI to Minikube (Important)
Before deploying, K8s needs to pull your local microservice Docker images. Run this command to build images directly inside Minikube's Docker daemon:
```bash
eval $(minikube docker-env)
```

Now build the Docker images (so Minikube has access to them):
```bash
docker compose build
```

### 3. Deploy to the Cluster
Apply all manifest configurations in order:
```bash
kubectl apply -f k8s/config.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/lemf-service.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Monitor the Deployments
Check the status of your services:
```bash
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

### 5. Access the App
Get the IP address of your Minikube cluster:
```bash
minikube ip
```
Add this IP address to your local `/etc/hosts` file (or simply access it via the IP) to route traffic through the K8s Ingress gateway.

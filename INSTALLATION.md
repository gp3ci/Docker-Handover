# Gp3NetMapper - Setup & Installation Guide

Welcome to the **Gp3NetMapper** Telecom Vision AI tool. This application is fully containerized using Docker, meaning you do not need to install Python, Node.js, or any complex dependencies to run it. 

Follow the steps below to get the application running on your local machine.

---

## 1. System Prerequisites

Before you begin, ensure your computer has the following software installed:

*   **Git:** Required to download the source code. ([Download Git here](https://git-scm.com/downloads))
*   **Docker Desktop:** Required to run the isolated application containers. ([Download Docker Desktop here](https://www.docker.com/products/docker-desktop/))
    *   *Note for Windows Users:* Ensure you install Docker Desktop using the **WSL 2 backend** (Windows Subsystem for Linux), as this is required for Docker to access your NVIDIA GPU.
*   **NVIDIA GPU Drivers:** Ensure your computer has the latest NVIDIA graphics drivers installed for your GPU.

---

## 2. Download the Application

Open your computer's terminal (Command Prompt or PowerShell on Windows, Terminal on Mac/Linux) and clone the repository to your local machine:

```bash
git clone https://github.com/your-username/Gp3NetMapper.git
cd Gp3NetMapper
```

*(If you were provided a `.zip` file instead of a GitHub link, simply extract the ZIP file, open your terminal, and `cd` into the extracted folder).*

---

## 3. Start the Application

Once you are inside the `Gp3NetMapper` folder, run the following command to build and launch the application:

```bash
docker-compose up --build -d
```

**What is happening?**
*   The `--build` flag tells Docker to download all the necessary AI libraries (like OpenCV and YOLO) and compile the React frontend. **This process will take 5 to 10 minutes the very first time you run it.**
*   The `-d` flag tells Docker to run the engine in the background (detached mode). 
*   Once the terminal returns to normal, you can close the terminal window entirely. The application will continue running silently in the background.

---

## 4. Access the Application

Open your preferred web browser (Google Chrome is recommended) and navigate to:

👉 **http://localhost:3000**

You are now ready to start uploading maps and running the AI analysis! 

*(Note: Because the tool runs as a background service, if you shut down your computer and turn it back on tomorrow, the tool will automatically start up. You only ever need to open `http://localhost:3000` to access it).*

---

## 5. Stopping or Updating the Tool

If you ever need to forcefully stop the AI engine and completely shut down the application, open a terminal in the `Gp3NetMapper` folder and run:

```bash
docker-compose down
```

**How to Update:**
If the development team pushes a new update to GitHub, you can update your local tool by running:
```bash
git pull
docker-compose up --build -d
```
This will pull the new code, rebuild the engine, and seamlessly replace your old version.

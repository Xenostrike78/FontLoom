
# FontLoom

FontLoom is an intelligent font recommendation system that helps designers and developers discover visually compatible fonts.
It combines **machine learning techniques** with a web interface to recommend fonts based on similarity and clustering.

The project uses a **Django-based ML backend** and a **Node.js + Express frontend**, containerized using **Docker** for easy deployment.

---

## Features

* Smart font recommendation system
* Font similarity detection using machine learning
* Font clustering to group visually similar fonts
* User-friendly web interface
* Scalable backend architecture
* Docker-based deployment

---

## Machine Learning Models

FontLoom uses the following algorithms:

**K-Nearest Neighbors (KNN)**
Used to recommend fonts similar to a selected font.

**K-Means Clustering**
Groups fonts into clusters based on their features.

These models allow FontLoom to suggest fonts that maintain visual harmony in typography design.

---

## Project Architecture

The project consists of two main components.

### 1. Backend (MODEL)

Built with **Django** and responsible for handling machine learning logic.

```
MODEL/
│
├── FontLoom_model/
│   ├── views.py
│   ├── urls.py
│   └── settings.py
│
├── manage.py
├── requirement.txt
└── DockerFile.django
```

Responsibilities:

* ML model processing
* Recommendation API
* Font similarity computation

---

### 2. Frontend (WEB)

Built using **Node.js and Express.js**.

```
WEB/
│
├── server.js
├── routes/
├── views/
├── public/
├── DockerFile.node
└── docker-compose.yaml
```

Responsibilities:

* User interface
* API requests
* Rendering font recommendations

---

## Tech Stack

Frontend

* Node.js
* Express.js
* HTML / CSS / JavaScript

Backend

* Django
* Python

Machine Learning

* Scikit-learn
* KNN Algorithm
* K-Means Clustering

Deployment

* Docker
* Docker Compose

---

## How It Works

1. The user selects or searches for a font.
2. The request is sent to the backend recommendation system.
3. The machine learning model analyzes font features.
4. Similar fonts are identified using KNN.
5. Fonts are grouped using K-Means clustering.
6. The system returns recommended fonts to the frontend.

---

## Installation

### Clone the repository

```
git clone https://github.com/yourusername/fontloom.git
cd fontloom
```

---

### Run with Docker

```
docker-compose up --build
```

This will start both:

* Django ML backend
* Node.js frontend server

---

## Future Improvements

* Deep learning based font embeddings
* Font pair recommendation system
* User preference learning
* Google Fonts API integration
* Visual similarity detection using CNN


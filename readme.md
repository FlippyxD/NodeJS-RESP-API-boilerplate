# Example NodeJS API (job portal)

Example REST API that can serve as a boilerplate for future projects

# Stack

NodeJS, Express, MongoDB (Mongoose)

# Features

Fully functional authentication and authorization (JWT in cookie, role based model – admin > recruiter > user) system, route protection, geolocation, fileupload, automatic email sending (confirm registration, forgot password etc.) custom middlewares for error handling and advanced  search results (pagination, sorting, selecting specific fields) via query parameters and external security npm packages (helmet, xss, hpp, rate-limit, mongoSanitize, cors)

# Usage

1. Clone/download repo to your local machine
2. From the inside of the repository install necessary dependencies with:
```
npm i
```
3. Populate necessary values (API keys) for the global variables in **./config/.env** file 

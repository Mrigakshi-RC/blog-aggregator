# Blog Aggregator CLI

A powerful command-line interface (CLI) tool that allows you to aggregate RSS feeds, manage user subscriptions, and follow your favorite blogs directly from your terminal.

## Prerequisites

Before running the program, ensure you have the following installed:
*   **Node**
*   **PostgreSQL** (running locally or a connection string to a hosted instance)

## Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com
    cd blog-aggregator
    ```

2.  **Database Configuration**
    Create a PostgreSQL database and apply the migrations located in the `src/lib/db` directory.

3.  **Configure the Tool**
    The program looks for a configuration file at `~/.gatorconfig.json`. Create this file to set your database URL:
    ```json
    {
      "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable",
      "current_user_name": ""
    }
    ```

## Usage & Commands

The CLI supports several commands to manage users and feeds from the root of the project. Here are some of the most common ones:

### User Management
*   **Register a user:**
    ```bash
    npm run start register <username>
    ```
*   **Login as a user:**
    ```bash
    npm run start login <username>
    ```
*   **List all users:**
    ```bash
    npm run start users
    ```

### Feed Management
*   **Add a new RSS feed:**
    ```bash
    npm run start addfeed <name> <url>
    ```
*   **List all tracked feeds:**
    ```bash
    npm run start feeds
    ```
*   **Follow an existing feed:**
    ```bash
    npm run start follow <url>
    ```

### Aggregator
*   **Start the aggregator (worker):**
    This command will begin fetching posts from the feeds in your database at a specific interval.
    ```bash
    npm run start agg 1m
    ```

## How it Works
This tool uses a background worker (`agg`) to poll RSS feeds and save posts to your PostgreSQL database. You can then view or manage these subscriptions via the other CLI commands.

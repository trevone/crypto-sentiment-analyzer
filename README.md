# crypto-sentiment-analyzer

Awesome! Your GitHub repo is live: [crypto-sentiment-analyzer](https://github.com/trevone/crypto-sentiment-analyzer). Let's get started with the foundational setup.

---

## 🛠️ Step 1: Initialize the Project

### 1.1 Create the Initial Files

In your local project directory, create the following files:

* `README.md`: Provide an overview of the project, its purpose, and how to set it up.
* `.gitignore`: Exclude unnecessary files from version control (e.g., virtual environments, compiled files).
* `requirements.txt`: List the Python dependencies needed for the project.

### 1.2 Populate `README.md`

Here's a basic template for your `README.md`:

````markdown
# Crypto Sentiment Analyzer

A Python-based sentiment analysis tool that gauges public sentiment on cryptocurrencies by analyzing Reddit discussions.

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/trevone/crypto-sentiment-analyzer.git
   cd crypto-sentiment-analyzer
````

2. Create and activate a virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up your Reddit API credentials:

   * Visit [Reddit App Preferences](https://www.reddit.com/prefs/apps).
   * Create a new application to obtain your `client_id`, `client_secret`, and `user_agent`.
   * Store these credentials securely and use them in your application as needed.

## Usage

* Run the sentiment analysis script:

  ```bash
  python src/main.py
  ```

* View the results in the `data/processed/` directory.

## License

This project is licensed under the MIT License.

```

### 1.3 Populate `.gitignore`

Here's a basic template for your `.gitignore`:

```

# Python bytecode files

*.pyc
*.pyo
**pycache**/

# Virtual environment

venv/

# Jupyter Notebook checkpoints

.ipynb_checkpoints/

# VS Code settings

.vscode/

# PyCharm settings

.idea/

# Environment variables

.env

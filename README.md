## Mail

Front-end for an email client that makes API calls to send and receive emails on a single page.


## Features

Using JavaScript, HTML, and CSS, complete the implementation of your single-page-app email client inside of inbox.js.

The following features are available:

* Send Mail: When a user submits the email composition form, JavaScript code will send the email.

* Mailbox: When a user visits their Inbox, Sent mailbox, or Archive, load the appropriate mailbox.

* View Email: When a user clicks on an email, the user should be taken to a view where they see the content of that email.

* Archive and Unarchive: Allow users to archive and unarchive emails that they have received.

* Reply: Allow users to reply to an email.


## Installation

1. Clone repository

2. In the repository directory create a virtual environment and activate it

```bash
python3 -m venv <venv_name>
source <venv_name>/bin/activate
```
3. Install packages from requirements.txt in the virtual environment

```bash
pip install -r requirements.txt
```

## Usage
Inside app directory run:

```bash
python manage.py runserver

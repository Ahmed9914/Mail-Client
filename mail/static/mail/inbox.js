document.addEventListener('DOMContentLoaded', () => {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients="", subject ="", body="") {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Fill composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;

  // Submit form eventListener for sending a amail
  document.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get data from fields
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // confirm that recipients isn't empty
    if (recipients) {
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: `${recipients}`,
            subject: `${subject}`,
            body: `${body}`
        })
      })
      .then(response => response.json())
      .then(result => {
          if (result.error) {
            alert(result.error);
          } else {
            load_mailbox('sent');
          }
      });
      }
  });
}

function build_mailbox(container, mails, mailBox) {
  
  // Clear container
  const oldContainer = document.querySelector('#table-responsive');
  if (oldContainer) {
    container.removeChild(oldContainer);
  }

  const mailbox_fragment = document.createDocumentFragment();

  const responsiveContainer = document.createElement('div');
  responsiveContainer.className = 'table-responsive';

  // Create table
  const table = document.createElement('table');
  table.className = 'table table-hover';

  // table header
  const header = document.createElement('thead');
  header.className = "thead-dark";
  header.id = "thead";

  // table header rows
  const head_row = document.createElement('tr');
  head_row.insertAdjacentHTML("beforeend", '<th scope="col">Timestamp</th>');
  if (mailBox==='sent') {
    head_row.insertAdjacentHTML("beforeend", '<th scope="col">To</th>');
  } else {
    head_row.insertAdjacentHTML("beforeend", '<th scope="col">From</th>');
  }
  head_row.insertAdjacentHTML("beforeend", '<th scope="col">Subject</th>');

  if (mailBox==='archive' || mailBox==='inbox') {
    head_row.insertAdjacentHTML("beforeend", '<th scope="col">Action</th>')
  }
  
  // Finish header rows
  header.append(head_row);
  table.append(header);

  // table body
  const body = document.createElement('tbody');

  // Append rows
  for (const mail of mails) {
    const row = document.createElement('tr');
    row.className = 'hover';
    row.insertAdjacentHTML("beforeend", `<td>${mail.timestamp}</td>`);

    // Show sender or recipients
    if (mailBox==='sent') {
    row.insertAdjacentHTML("beforeend", `<td>${mail.recipients.length > 1 ? mail.recipients.join() : mail.recipients[0]}</td>`);
    } else {
      row.insertAdjacentHTML("beforeend", `<td>${mail.sender}</td>`);
    }
    
    // Show mail
    const td = document.createElement('td');
    td.innerText = mail.subject;
    td.id = "subject";
    td.addEventListener("click", () => {
      mark_mail_read(mail.id)
      .then(() => load_mail_data(mail.id))
      .then(data => load_mail(data));
    });
    row.append(td);
    
    // Convert to button (archive/unarchive)
    if (mailBox==='archive') {
      const td = document.createElement('td');
      const btn = document.createElement('button');
      btn.id = `email/${mail.id}`;
      btn.innerText = "unarchive";
      btn.className = "btn btn-sm btn-outline-primary";
      td.appendChild(btn);
      td.addEventListener("click", () => {unarchiveMail(mail.id);});
      row.append(td);
    } else if (mailBox==='inbox') {
      const td = document.createElement('td');
      const btn = document.createElement('button');
      btn.id = `email/${mail.id}`;
      btn.innerText = "archive";
      btn.className = "btn btn-sm btn-outline-primary";
      td.appendChild(btn);
      td.addEventListener("click", () => {archiveMail(mail.id);});
      row.append(td);
    }

    mail.read ? row.className ="table-dark" : row.className ="table-light";
    
    body.append(row);
  }

  // Finally append tbody to table
  table.append(body);
  responsiveContainer.appendChild(table);
  mailbox_fragment.append(responsiveContainer);
  
  container.append(mailbox_fragment);
}

function load_mailbox(mailbox) {
  
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Save the container element to fill it later
  const emailsContainer = document.querySelector('#emails-view');

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    switch (mailbox) {
      case 'inbox':
        build_mailbox(emailsContainer, emails, 'inbox');
        break;
        
      case 'sent':
        build_mailbox(emailsContainer, emails, 'sent');
        break;

      case 'archive':
        build_mailbox(emailsContainer, emails, 'archive');
        break;

      default:
        console.log("An error has occured.")
        break;
    }
  });

}

function archiveMail(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(() => {
    load_mailbox('inbox');
    });
}

function unarchiveMail(id) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  .then(() => {
    load_mailbox('inbox');
    });
}

async function mark_mail_read(id) {
  await fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  try {
    // Print result and load inbox
    console.log(`marked mail ${id} as read`);
    } catch (error){
      console.log("error", error);
    }
}

async function load_mail_data(id) {
  const mailLink = `/emails/${id}`;
  const request = await fetch(mailLink);
  try {
    const data = await request.json();
    return data;
  } catch (error){
      console.log("error", error);
  }
}

function load_mail(email) {
  // Show the mail view and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  

  // build html of email view

  const mailContainer = document.querySelector('#email-view');
  
  // Clear container
  const oldContainer = document.querySelector('#mail-container');
  if (oldContainer) {
    mailContainer.removeChild(oldContainer);
  }

  const mail_fragment = document.createDocumentFragment();

  const mailContent = document.createElement('div');
  mailContent.id = "mail-container";

  // Get fields values
  const timestamp = email.timestamp;
  const sender = email.sender;
  const recipients = email.recipients.length > 1 ? email.recipients.join() : email.recipients[0];
  let subject = email.subject;
  let body = email.body;

  const mailHtml = `
  <div><b>From:</b> ${sender}</div>
  <div><b>To:</b> ${recipients}</div>
  <div><b>Subject:</b> ${subject}</div>
  <div><b>Timestamp:</b> ${timestamp}</div>
  <hr>
  <p>${body}</p>
  <hr>`;
  mailContent.innerHTML = mailHtml;

  if (!subject.includes('RE:')) {
    subject = 'RE: ' + subject;
  }

  body = `On ${timestamp} ${sender} wrote:
  ${body}`;

  const btn = document.createElement('button');
  btn.innerText = "Reply";
  btn.className = "btn btn-sm btn-outline-primary";
  btn.addEventListener("click", () => {
    compose_email(sender, subject, body);
  });
  mailContent.appendChild(btn);

  mail_fragment.append(mailContent);

  mailContainer.append(mail_fragment);

  
}
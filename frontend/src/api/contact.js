// frontend/src/api/contact.js
import api from './index'

export const sendContactMessage = ({ subject, body }) =>
  api
    .post('/api/users/messages', {
      subject,
      body,
      toEmail: 'kbookhelp@kbook.com' // 👈 fuerza el admin destino
    })
    .then((r) => r.data)

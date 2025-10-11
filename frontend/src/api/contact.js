import api from './index'
// enviar mensajes de contact de usuario a soporte
export const sendContactMessage = ({ subject, body }) =>
  api
    .post('/api/users/messages', {
      subject,
      body,
      toEmail: 'kbookhelp@kbook.com' // fuerzo admin real
    })
    .then((r) => r.data)

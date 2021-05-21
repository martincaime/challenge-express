var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
  clients: {}
};

model.reset = () => {
  model.clients = {};
}

model.addAppointment = (name, date) => {
  if (!model.clients[name]) {
    model.clients[name] = [];
    model.clients[name].push({ ...date, status: 'pending' });
  }
  else {
    model.clients[name].push({ ...date, status: 'pending' });
  }
}

model.attend = (name, date) => {
  let appointment = model.clients[name].find(d => d.date === date);
  appointment.status = 'attended';
}
model.expire = (name, date) => {
  let appointment = model.clients[name].find(d => d.date === date);
  appointment.status = 'expired';
}

model.cancel = (name, date) => {
  let appointment = model.clients[name].find(d => d.date === date);
  appointment.status = 'cancelled';
}

model.erase = (name, arg) => {
  if (arg === 'attended' || arg === 'expired' || arg === 'cancelled') {
    model.clients[name] = model.clients[name].filter(d => d.status !== arg);
  }
  else {
    let appointment = model.clients[name].find(d => d.date === arg);
    let index = model.clients[name].indexOf(appointment);
    model.clients[name].splice(index, 1);
  }
}

model.getAppointments = (name, status) => {
  if (status) {
    return model.clients[name].filter(d => d.status === status)
  }
  return model.clients[name]
}

model.getClients = () => {
  return Object.keys(model.clients)
}

server.use(bodyParser.json());

server.get('/api', (req, res) => {
  res.send(model.clients)
})

server.post('/api/Appointments', (req, res) => {
  if (!req.body.client) {
    res.status(400).send('the body must have a client property')
  }
  else if (typeof req.body.client !== 'string') {
    res.status(400).send('client must be a string')
  }
  else {
    model.addAppointment(req.body.client, req.body.appointment)
    let appointment = model.clients[req.body.client].find(d => d.date === req.body.appointment.date);
    res.send(appointment)
  }
})

server.get('/api/Appointments/:name', (req, res) => {
  let clients = model.getClients()
  let client = clients.includes(req.params.name)
  let appointments = model.getAppointments(req.params.name)
  if (req.params.name === 'clients') {
    res.send(clients)
  }
  else if (client === false && req.params.name !== 'clients') {
    res.status(400).send('the client does not exist')
  }
  else if (!appointments.find(d => d.date === req.query.date)) {
    res.status(400).send('the client does not have a appointment for that date')
  }
  else if (req.query.option !== 'attend' && req.query.option !== 'expire' && req.query.option !== 'cancel') {
    res.status(400).send('the option must be attend, expire or cancel')
  }
  else if (req.query.option === 'attend') {
    model.attend(req.params.name, req.query.date)
    let appointments2 = model.getAppointments(req.params.name)
    let appointment = appointments2.find(d => d.date === req.query.date)
    res.send(appointment)
  }
  else if (req.query.option === 'expire') {
    model.expire(req.params.name, req.query.date)
    let appointments2 = model.getAppointments(req.params.name)
    let appointment = appointments2.find(d => d.date === req.query.date)
    res.send(appointment)
  }
  else if (req.query.option === 'cancel') {
    model.cancel(req.params.name, req.query.date)
    let appointments2 = model.getAppointments(req.params.name)
    let appointment = appointments2.find(d => d.date === req.query.date)
    res.send(appointment)
  }
})

server.get('/api/Appointments/:name/erase', (req, res) => {
  let clients = model.getClients()
  let client = clients.includes(req.params.name)
  if (client === false) {
    res.status(400).send('the client does not exist')
  }
  else if (req.query.date === 'expired' || req.query.date === 'attended' || req.query.date === 'cancelled') {
    let appointments = model.getAppointments(req.params.name)
    let appointment = appointments.filter(d => d.status === req.query.date)
    model.erase(req.params.name, req.query.date)
    res.send(appointment)
  }
  else {
    let appointments = model.getAppointments(req.params.name)
    let appointment = appointments.find(d => d.date === req.query.date)
    model.erase(req.params.name, req.query.date)
    res.send(appointment)
  }
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
  let appointments = model.getAppointments(req.params.name, req.query.status)
  res.send(appointments)
})

server.listen(3000);
module.exports = { model, server };

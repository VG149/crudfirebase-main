const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./key.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina.handlebars")
})

app.get("/consulta", function(req, res){
    db.collection('agendamentos').get().then((snapshot) => {
        const agendamentos = [];
        snapshot.forEach((doc) => {
          agendamentos.push({ id: doc.id, ...doc.data() });
        });
        res.render("consulta.handlebars", { agendamentos });
      })
})

app.get("/editar/:id", function(req, res){
    const id = req.params.id;
    db.collection('agendamentos').doc(id).get().then((doc) => {
        if (doc.exists) {
          const agendamentoData = doc.data();
          agendamentoData.id = id
          console.log(agendamentoData)
          res.render("editar", { agendamento: agendamentoData });
        } else {
            res.render("editar", { error: 'Dado inválido.' });
        }
    })
})

app.get("/excluir/:id", function(req, res){
    const id = req.params.id;
    db.collection('agendamentos').doc(id).delete().then(() => {
        console.log('Dado removido com sucesso.');
        res.redirect('/consulta');
    })
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
    const id = req.body.id;
    db.collection('agendamentos').doc(id).update({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao
    })
    console.log('O dado foi atualizado.');
    res.redirect('/consulta');
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import router from './routes';
// const express=require('express');
// const morgan=require('morgan');
// const cors=require('cors');

// conexion a la base de datos
mongoose.Promise=global.Promise;
const dbUrl = 'mongodb://localhost:27017/dbsistema';
mongoose.connect(dbUrl, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
  .then(mongoose => console.log('conectado en el puerto 27017'))
  .catch(err => console.log(err));
const app=express();
app.use(morgan('dev'));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

// llamamos a las rutas
app.use('/api', router);

app.set('port', process.env.PORT || 3000)

app.listen(app.get('port'), () =>{
  console.log('server on port ' +app.get('port'));
})
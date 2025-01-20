import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.listen(process.env.EXPRESS_PORT,()=>{
    console.log('server is gestart')
});
app.get('/', (req, res) => {
    res.json({ message: 'welkom!!!!!' });
});
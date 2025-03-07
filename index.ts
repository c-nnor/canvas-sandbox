import express from 'express'

const app = express();

app.use(express.json());
app.use(express.static('public'))

const port = 3000;

app.get('/', (req, res) => {
    res.status(200).send('Welcome to the app')
});

app.listen(port, () => {
    console.log(`Listening on: http://localhost:${port}`)
});
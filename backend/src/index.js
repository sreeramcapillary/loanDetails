let express  = require("express")
let app = express()
var bodyParser = require('body-parser');




app.use(function (req, res, next) {
    //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
    next();
    });

//body parse
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }))
// parse application/json
app.use(bodyParser.json({limit: '50mb', extended: true}))

let loan = require("./models/loan.model")

app.use(express.json())

app.use(loan)
//404 handler
app.use((request, response, next) => {
    response.status(404).send(`Looks like you are in wrong place`)
})

//500 handler
app.use((err, request, response, next) => {
    response.status(500).send(`Server Error.......`+err)
})



//port
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started in ${PORT}`))

// console.log('rajesh');
import express from 'express'
const app = express()
import userRoutes from '../Controllers/UsersControllers.js'
import bodyParser from 'body-parser'


import connectDb from '../database/db.js'
connectDb()
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})

app.use(bodyParser.json())
app.use('/user', userRoutes)

// app.get('/', (req, res) => {
//     res. send("welcom to node");
// })

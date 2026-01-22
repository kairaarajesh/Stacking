import express from 'express'
const app = express()
import adminRoutes from '../Controllers/adminController.js'
import productRoutes from '../Controllers/productControllers.js'
import complaintRoutes from '../Controllers/complaintControllers.js'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config({path:'./.env'})

import connectDb from '../database/db.js'
connectDb()
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})

app.use(bodyParser.json())
app.use('/register', adminRoutes)
app.use('/product', productRoutes)
app.use('/complaint', complaintRoutes)

// app.get('/', (req, res) => {
//     res. send("welcom to node");
// })

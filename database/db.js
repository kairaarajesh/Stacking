const mongoese = require('mongoose');
// require('dotenv').config();
const mongoese_url ='mongodb://localhost:27017/stacking'

const connectDb =async () => {
    try{
        await mongoese.connect(mongoese_url);
        console.log(`Mongodb Server Connected ${mongoese_url}`)
    }catch (error){

        console.log(`MongoDb server not connected ${error}`)
    }

} 

module.exports = connectDb

import express from 'express';
import router from './router/route';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(express.json())
app.use(cookieParser());
app.use('/api', router)

app.listen(PORT, ()=>{
    console.log('Server running at port 4000')
})
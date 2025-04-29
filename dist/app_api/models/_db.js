import mongoose from 'mongoose';
const connectString = "mongodb+srv://wrightca5:Aalika20326@cluster0.vojvtak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(connectString);
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected`);
});
mongoose.connection.on('error', (err) => {
    console.log(`Mongoose connection error:`, err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

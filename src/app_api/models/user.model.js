import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});
const User = mongoose.model('User', userSchema);
export default User;

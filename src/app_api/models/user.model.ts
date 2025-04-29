import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    googleId: string,
    email: string,
    name: string,
    
}

const userSchema = new Schema<IUser>({
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

const User = mongoose.model<IUser>('User', userSchema);

export default User;
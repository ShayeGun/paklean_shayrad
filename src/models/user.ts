import { Model, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    nationalCode: string;
    phone: string;
    email: string;
}

interface IUserMethods {
    correctPassword(): string
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },
    nationalCode: { type: String, required: true },
    phone: { type: String, required: true },
    email: {
        type: String, required: true, unique: true,
        lowercase: true,
    }
});

userSchema.method('correctPassword', async function correctPassword(userPass) {
    const bcryptPass = this.password
    return await bcrypt.compare(userPass, bcryptPass);
})


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

const User = model<IUser, UserModel>('User', userSchema);

export { User }
import { Model, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

enum Roles {
    user = "user",
    admin = "admin"
}

interface IUser {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    nationalCode: string;
    phone: string;
    email: string;
    role: Roles;
}

interface IUserMethods {
    correctPassword(password: any): string
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: {
        type: String,
        required: true,
        select: false,
        validate: [{
            validator: function checkPassword(str: string) {
                var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
                return re.test(str);
            },
            message: 'password must be at least 8 characters and with a symbol, number, lower and upper-case letters'
        }]
    },
    nationalCode: {
        type: String, required: true,
        unique: true,
        maxlength: 10,
        minlength: 10,
        validate: [validator.isNumeric, 'not valid national-code']
    },
    phone: {
        type: String, required: true, unique: true,
        maxlength: 11,
        minlength: 11,
        validate: [validator.isMobilePhone, 'not valid phone number']
    },
    email: {
        type: String, required: true, unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'not valid email']
    },
    role: {
        type: String,
        enum: Roles,
        default: Roles.user
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
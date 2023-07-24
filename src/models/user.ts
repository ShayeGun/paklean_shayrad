import mongoose, { Model, model, mongo, Schema } from 'mongoose';
import validator from 'validator';

enum Roles {
    user = "user",
    admin = "admin"
}

interface IUser {
    firstName?: string;
    lastName?: string;
    nationalCode: string;
    mobile: string;
    userId?: string;
    drivingLicense?: mongoose.Schema.Types.ObjectId[]
    role: Roles;
}

interface IUserMethods { }

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    firstName: { type: String },
    lastName: { type: String },
    nationalCode: {
        type: String, required: true,
        unique: true,
        maxlength: 10,
        minlength: 10,
        validate: [validator.isNumeric, 'not valid national-code']
    },
    mobile: {
        type: String, required: true, unique: true,
        maxlength: 11,
        minlength: 11,
        validate: [validator.isMobilePhone, 'not valid phone number']
    },
    userId: {
        type: String
    },
    role: {
        type: String,
        enum: Roles,
        default: Roles.user
    },
    drivingLicense: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'License'
    }]
});

const User = model<IUser, UserModel>('User', userSchema);

export { User }
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
    negativePoint?: string,
    isDrivingAllowed?: boolean,
    role: Roles;
}

interface IUserMethods { }

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    firstName: { type: String },
    lastName: { type: String },
    nationalCode: {
        type: String, required: true,
        maxlength: 10,
        minlength: 10,
        validate: [validator.isNumeric, 'not valid national-code']
    },
    mobile: {
        type: String, required: true,
        maxlength: 11,
        minlength: 11,
        validate: [validator.isMobilePhone, 'not valid phone number']
    },
    userId: {
        type: String
    },
    negativePoint: {
        type: String
    },
    isDrivingAllowed: {
        type: Boolean
    },
    role: {
        type: String,
        enum: Roles,
        default: Roles.user
    }
});

// searches are based on national-code and mobile-number
userSchema.index({ nationalCode: 1, mobile: 1 }, { unique: true });

const User = model<IUser, UserModel>('User', userSchema);

export { User }
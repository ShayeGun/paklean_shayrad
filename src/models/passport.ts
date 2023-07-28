import { Model, model, Schema } from 'mongoose';

interface IPassport {
    nationalCode: string,
    hasPassport: boolean,
    hasRequest: boolean,
    requestStatue: string,
    requestDate: string,
    postBarcode: string,
    passportNo: string,
    issueDate: string,
    expiryDate: string,
    status: string,
    isPersonFound: boolean
}

interface IPassportMethods { }

type PassportModel = Model<IPassport, {}, IPassportMethods>;

const passportSchema = new Schema<IPassport, PassportModel, IPassportMethods>({
    nationalCode: String,
    hasPassport: Boolean,
    hasRequest: Boolean,
    requestStatue: String,
    requestDate: String,
    postBarcode: String,
    passportNo: String,
    issueDate: String,
    expiryDate: String,
    status: String,
    isPersonFound: Boolean

}, {
    toJSON: {
        // not show __v , _id 
        transform(doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

// searches are based on national-code so it must be indexed and each person has one passport
passportSchema.index({ nationalCode: 1 }, { unique: true });

const Passport = model<IPassport, PassportModel>('Passport', passportSchema);

export { Passport }
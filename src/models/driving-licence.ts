import { Model, model, Schema } from 'mongoose';

interface ILicense {
    nationalCode: string,
    title: string,
    rahvarStatus: string,
    barcode: string,
    printNumber: string,
    printDate: string,
    validYears: string
}

interface ILicenseMethods { }

type LicenseModel = Model<ILicense, {}, ILicenseMethods>;

const licenseSchema = new Schema<ILicense, LicenseModel, ILicenseMethods>({
    nationalCode: String,
    title: String,
    rahvarStatus: String,
    barcode: String,
    printNumber: String,
    printDate: String,
    validYears: String

}, {
    toJSON: {
        // not show __v , _id 
        transform(doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

// searches are based on national-code so it must be indexed
licenseSchema.index({ nationalCode: 1 });
// combination of barcode and title must be unique and it must not effect national-code cuz 1 person can have multiple licenses
licenseSchema.index({ barcode: 1, title: 1 }, { unique: true });

const License = model<ILicense, LicenseModel>('License', licenseSchema);

export { License }
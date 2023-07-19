import { Model, model, Schema } from 'mongoose';
import validator from 'validator';

interface ILicense {
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
    title: String,
    rahvarStatus: String,
    barcode: String,
    printNumber: String,
    printDate: String,
    validYears: String

});

const License = model<ILicense, LicenseModel>('License', licenseSchema);

export { License }
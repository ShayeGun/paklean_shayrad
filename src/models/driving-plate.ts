import { Model, model, Schema } from 'mongoose';

interface IPlate {
    nationalCode: string,
    serial: string,
    licensePlateNumber: string,
    description: string,
    separationDate: string,
    licensePlate: string
}

interface IPlateMethods { }

type PlateModel = Model<IPlate, {}, IPlateMethods>;

const plateSchema = new Schema<IPlate, PlateModel, IPlateMethods>({
    nationalCode: String,
    serial: String,
    licensePlateNumber: String,
    description: String,
    separationDate: String,
    licensePlate: String

});

// searches are based on national-code and license-plate-number
plateSchema.index({ nationalCode: 1, licensePlateNumber: 1 }, { unique: true });


const Plate = model<IPlate, PlateModel>('Plate', plateSchema);

export { Plate }
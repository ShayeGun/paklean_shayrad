import { Model, model, Schema, Types } from 'mongoose';

function getVehicleType(plateNum: string) {
    if (plateNum.length === 9) return vehicle.car
    else if (plateNum.length === 11 && plateNum.slice(0, 2) === "08") return vehicle.motor
    // future plate types
    return vehicle.else
}

function formatLicensePlate(plateNum: string, vehicleType: vehicle) {
    if (vehicleType === vehicle.car) {
        const provenance = plateNum.slice(0, 2);
        const letter = plateLetters[plateNum.slice(2, 4)];
        const leftSection = plateNum.slice(4, 6);
        const rightSection = plateNum.slice(6);

        return {
            provenance,
            letter,
            leftSection,
            rightSection
        }

    }
    else if (vehicleType === vehicle.motor) {
        const leftConstant = plateNum.slice(0, 2);
        const upperSection = plateNum.slice(2, 5);
        const leftSection = plateNum.slice(5, 10);
        const rightConstant = plateNum.slice(10);

        return {
            leftConstant,
            upperSection,
            leftSection,
            rightConstant
        }
    }

    return
}

const plateLetters: Record<string, string> = {
    "02": "ب",
    "03": "ت",
    "04": "ج",
    "05": "د",
    "06": "س",
    "07": "ص",
    "08": "ط",
    "09": "ع",
    "10": "ق",
    "11": "ل",
    "12": "م",
    "13": "ن",
    "14": "و",
    "15": "ه",
    "16": "ی",
    "19": "ژ",
}

enum vehicle {
    car = 'car',
    motor = 'motor',
    else = ''
}

interface IPlate {
    nationalCode: string,
    serial: string,
    licensePlateNumber: string,
    description: string,
    separationDate: string,
    licensePlate: string,
    vehicleType: vehicle,
    formattedPlate: Record<string, any>,
    totalViolationInfo: Record<string, any>,
    vehicleViolations: Types.ObjectId[],
    cardPrintDate: string,
    cardPostalBarcode: string,
    cardStatusTitle: string,
    documentPrintDate: string,
    documentPostalBarcode: string,
    documentStatusTitle: string,
}

interface IPlateMethods { }

type PlateModel = Model<IPlate, {}, IPlateMethods>;

const plateSchema = new Schema<IPlate, PlateModel, IPlateMethods>({
    nationalCode: String,
    serial: String,
    licensePlateNumber: String,
    description: String,
    separationDate: String,
    licensePlate: String,
    vehicleType: String,
    formattedPlate: Schema.Types.Mixed,
    // denormalizing cuz of total violation into like total-payment-id, total-payment, ... which its logic is in api and we don't need to implement it in our business logic
    vehicleViolations: [{
        type: Schema.Types.ObjectId,
        ref: "Violation",
    }],
    totalViolationInfo: {
        type: Schema.Types.Mixed,
        default: {}
    },
    cardPrintDate: String,
    cardPostalBarcode: String,
    cardStatusTitle: String,
    documentPrintDate: String,
    documentPostalBarcode: String,
    documentStatusTitle: String,
}, {
    toJSON: {
        // not show __v , _id 
        transform(doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

// searches are based on national-code and license-plate-number
plateSchema.index({ nationalCode: 1, licensePlateNumber: 1 }, { unique: true });

plateSchema.pre('save', async function (next) {
    // for users that don't own a plate license ,licensePlateNumber = null
    if (this.licensePlateNumber) {
        this.vehicleType = getVehicleType(this.licensePlateNumber);
        this.formattedPlate = formatLicensePlate(this.licensePlateNumber, this.vehicleType) || {};
    }

    next();
})


const Plate = model<IPlate, PlateModel>('Plate', plateSchema);

export { Plate, PlateModel }
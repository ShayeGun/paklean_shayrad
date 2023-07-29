import { Model, model, Schema } from 'mongoose';

interface IViolation {
    violationId: string,
    violationOccuredDate: string,
    violationOccuredTime: string,
    violationDeliveryType: Record<string, any>,
    violationAddress: string,
    violationType: Record<string, any>,
    finalPrice: string,
    paperId: string,
    paymentId: string,
    hasImage: boolean,
    plateImage: string,
    vehicleImage: string,
}

interface IViolationMethods { }

type ViolationModel = Model<IViolation, {}, IViolationMethods>;

const violationSchema = new Schema<IViolation, ViolationModel, IViolationMethods>({
    violationId: String,
    violationOccuredDate: String,
    violationOccuredTime: String,
    violationDeliveryType: Schema.Types.Mixed,
    violationAddress: String,
    violationType: Schema.Types.Mixed,
    finalPrice: String,
    paperId: String,
    paymentId: String,
    hasImage: Boolean,
    plateImage: String,
    vehicleImage: String
}, {
    toJSON: {
        // not show __v , _id 
        transform(doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

violationSchema.index({ violationId: 1 }, { unique: true });

const Violation = model<IViolation, ViolationModel>('Violation', violationSchema);

export { Violation }
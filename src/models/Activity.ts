import mongoose from 'mongoose';

export interface IActivity extends mongoose.Document {
    task: string;
    points: number;
    timestamp: Date;
}

const ActivitySchema = new mongoose.Schema<IActivity>({
    task: {
        type: String,
        required: [true, 'Please provide a task name'],
    },
    points: {
        type: Number,
        required: [true, 'Please provide points value'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

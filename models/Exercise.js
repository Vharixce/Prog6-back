import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        muscles: { type: String, required: true }, //
        description: { type: String, required: true },

    },
    {
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {


                ret._links = {
                    self: `${process.env.LOCALURL}/exercises/${ret._id}`,
                    collection: `${process.env.LOCALURL}/exercises`
                };

                delete ret._id;
            },
        },
    }
);


const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;

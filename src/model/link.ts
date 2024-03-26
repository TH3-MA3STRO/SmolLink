import mongoose from 'mongoose';
const {Schema, model} = mongoose;
const linkSchema = new Schema({
    link: {
        type: String,
        required: true,
    },
    shorthandLink: {
    type: String,
    required: true,
}})

const Link = model('Link', linkSchema);
export default Link;
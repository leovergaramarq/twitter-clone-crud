const mongoose = require('mongoose');

const { Schema } = mongoose;

module.exports = new mongoose.model('Counter', new Schema({ _id: String, seq: Number }, {
    statics: {
        // https://web.archive.org/web/20151009224806/http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
        async getNextSequence(id) {
            const ret = await this.findByIdAndUpdate(id, { $inc: { seq: 1 } }, { new: true, upsert: true });
            return ret.seq;
        }
    }
}));

import mongoose, {Document, mongo} from 'mongoose';

interface ICompany extends Document {
    name: string;
    description: string;
    location: string;
}

const companySchema = new mongoose.Schema<ICompany>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    },
    { timestamps: true },
    );

const Company = mongoose.model('Company', companySchema);
export default Company;

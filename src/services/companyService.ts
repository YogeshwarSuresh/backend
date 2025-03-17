import Company from '../models/Company';

export const createCompany = async (data: { name: string; description: string; location: string }) => {
    return await Company.create(data);
};

export const getCompanies = async () => {
    return await Company.find();
};

export const getCompanyById = async (id: string) => {
    return await Company.findById(id);
};

export const updateCompany = async (id: string, data: Partial<{ name: string; description: string; location: string }>) => {
    return await Company.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCompany = async (id: string) => {
    return await Company.findByIdAndDelete(id);
};

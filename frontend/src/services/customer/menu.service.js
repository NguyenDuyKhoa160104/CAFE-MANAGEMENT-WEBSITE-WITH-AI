import { customerApi } from "../../config/axios.config";

export const customerMenuService = {
    getCategories: () => {
        return customerApi.get("/categories");
    },
    getProducts: (params) => {
        return customerApi.get("/products", { params });
    },
    getProductDetail: (id) => {
        return customerApi.get(`/products/${id}`);
    }
};

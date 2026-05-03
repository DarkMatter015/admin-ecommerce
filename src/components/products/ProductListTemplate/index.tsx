import type { ICategory } from "@/commons/category_types";
import type { IProduct } from "@/commons/product_types";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { EditProductModal } from "../EditProductModal";

export const ProductListTemplate = (
    product: IProduct,
    index: number,
    categories: ICategory[],
) => {
    const [editModalVisible, setEditModalVisible] = useState(false);

    const handleEdit = () => {
        setEditModalVisible(true);
    };

    return (
        <>
            <EditProductModal
                product={product}
                visible={editModalVisible}
                setVisible={setEditModalVisible}
                categories={categories}
            />
            <div className="col-12" key={product.id}>
                <div
                    className={classNames(
                        "flex flex-column xl:flex-row xl:align-items-start p-4 gap-4",
                        { "border-top-1 surface-border": index !== 0 },
                    )}
                >
                    <Image
                        imageClassName="w-9 h-9 sm:w-16rem sm:h-16rem xl:w-5rem xl:h-5rem shadow-2 block xl:block mx-auto border-round"
                        src={`${product.urlImage}`}
                        alt={product.name}
                    />
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="flex align-items-center gap-3 flex-row">
                                <span className="text-2xl font-semibold border-1 border-solid text-green-700 px-2 py-1 border-round">
                                    R${product.price}
                                </span>
                                <div className="text-xl font-bold text-900">
                                    {product.name}
                                </div>
                            </div>

                            <div className="flex align-items-center gap-3">
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-tag"></i>
                                    <span className="font-semibold">
                                        {product.category.name}
                                    </span>
                                </span>
                                <Tag
                                    value={product.quantityAvailableInStock}
                                    severity="info"
                                ></Tag>
                            </div>
                        </div>
                        <div className="flex align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <Button
                                onClick={() => handleEdit()}
                                outlined
                                severity="info"
                                icon="pi pi-pencil"
                                className="p-button-rounded"
                            />
                            <Button
                                outlined
                                severity="danger"
                                icon="pi pi-trash"
                                className="p-button-rounded"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

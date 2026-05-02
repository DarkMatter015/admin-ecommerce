import type { IProduct } from "@/commons/product_types";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { classNames } from "primereact/utils";

export const ProductListTemplate = (product: IProduct, index: number) => {
    return (
        <div className="col-12" key={product.id}>
            <div
                className={classNames(
                    "flex flex-column xl:flex-row xl:align-items-start p-4 gap-4",
                    { "border-top-1 surface-border": index !== 0 },
                )}
            >
                <img
                    className="w-9 sm:w-16rem xl:w-10rem shadow-2 block xl:block mx-auto border-round"
                    src={`${product.urlImage}`}
                    alt={product.name}
                />
                <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                    <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                        <div className="text-2xl font-bold text-900">
                            {product.name}
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
                    <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                        <span className="text-2xl font-semibold">
                            ${product.price}
                        </span>
                        <Button
                            icon="pi pi-shopping-cart"
                            className="p-button-rounded"
                            disabled={product.quantityAvailableInStock === 0}
                        ></Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

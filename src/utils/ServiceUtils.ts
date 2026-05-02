import type { IPage } from "@/services/types/service_types";

export const normalizePage = (
	data: any,
	mapApiTo: (item: any) => any
): IPage<any> => {
	return {
		content: data.content.map(mapApiTo) ?? [],
		totalElements: data.totalElements,
		totalPages: data.totalPages,
		size: data.size,
		number: data.number,
		empty: data.empty,
	};
};

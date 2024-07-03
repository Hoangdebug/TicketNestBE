import { Document, FilterQuery, Model } from "mongoose"

export type PaginationType<T> = {
    page: number,
    pageSize: number,
    findCondition?: FilterQuery<T>,
    populateString?: string
}

export type PaginationResult<T> = {
    metadata: {
        pages: number,
        pageSize: number,
        currentPage: number,
        totalItems: number,
    }
    result: T[]
}
export const getAllWithPagination = async <T extends Document>(
    model: Model<T>,
    {
        page = 1,
        pageSize = 20,
        findCondition = {},
        populateString = ""
    }: PaginationType<T>
): Promise<PaginationResult<T>> => {
    const skip = (page - 1) * pageSize;

    const totalItems = await model.countDocuments(findCondition);

    const data = await model
        .find(findCondition)
        .populate(populateString)
        .skip(skip)
        .limit(pageSize)
        .exec();

    const pages = Math.ceil(totalItems / page)

    return {
        metadata: {
            currentPage: page,
            pages,
            pageSize,
            totalItems
        },
        result: data
    }
} 
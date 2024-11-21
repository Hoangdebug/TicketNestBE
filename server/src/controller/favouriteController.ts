import { Request, Response } from 'express';
import Favourite from '../models/favourite'; // Đảm bảo đường dẫn đúng với file model của bạn
import EventModel from '../models/event'; // Đảm bảo đường dẫn đúng với file model của Event

// Tạo một mục yêu thích
export const createFavourite = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { user, event } = req.body;

        // Kiểm tra đầu vào
        if (!user || !event) {
            return res.status(400).json({ message: "User and Event are required." });
        }

        // Tạo mục yêu thích mới
        const favourite = new Favourite({ cusname: { user }, eventname: { event } });
        await favourite.save();

        return res.status(201).json({
            message: "Favourite created successfully.",
            favourite,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error creating favourite.",
            error: error.message,
        });
    }
};

// Xóa mục yêu thích theo ID
export const deleteFavouriteById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        // Kiểm tra xem mục yêu thích có tồn tại không
        const favourite = await Favourite.findById(id);
        if (!favourite) {
            return res.status(404).json({ message: "Favourite not found." });
        }

        // Xóa mục yêu thích
        await favourite.deleteOne();

        return res.status(200).json({
            message: "Favourite deleted successfully.",
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error deleting favourite.",
            error: error.message,
        });
    }
};

// Lấy tất cả các event yêu thích của một user  
export const getFavouritesByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        // Tìm tất cả các mục yêu thích của userId
        const favourites = await Favourite.find({ 'cusname.user': userId })
            .populate('eventname.event') // Populate để lấy thông tin sự kiện (Event)
            .exec();

        if (!favourites || favourites.length === 0) {
            return res.status(404).json({ message: 'No favourites found for this user.' });
        }

        // Trả về danh sách sự kiện yêu thích của người dùng
        const events = await Promise.all(
            favourites.map(async (fav) => {
                // Kiểm tra nếu event tồn tại
                if (fav.eventname && fav.eventname.event) {
                    const event = await EventModel.findById(fav.eventname.event).exec();
                    return event;
                }
                return null; // Trả về null nếu không có event
            })
        );

        // Lọc các event null ra khỏi danh sách
        const validEvents = events.filter((event) => event !== null);

        return res.status(200).json({
            message: 'Favourites retrieved successfully.',
            favourites: validEvents,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: 'Error fetching favourites.',
            error: error.message,
        });
    }
};

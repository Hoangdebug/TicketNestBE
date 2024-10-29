export enum Role {
    ROLE_USER = 'ROLE_USER',
    ROLE_ADMIN = 'ROLE_ADMIN',
    ROLE_ORGANIZER = 'ROLE_ORGANIZER',
}

export enum TypeUser {
    USER = 'User',
    ADMIN = 'Admin',
    ORGANIZER = 'Organizer',
}

export enum Status {
    PROCESSING = 'Processing',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
}

// export enum EventTicket {
//     BASE = 50,
//     MEDIUM = 60,
//     LARGE = 70,
// }

export enum EventType {
    MUSIC = 'Music',
    DRAMATIC = 'Dramatic',
    WORKSHOP = 'Workshop',
}

export enum EventStatus {
    CANCELLED = "Cancelled",
    PENDING = "Pending",
    SUCCESSED = "Successed",
    OVER_DATE = 'Overdated',
}

export enum OrderStatus {
    CANCELLED = "Cancelled",
    PENDING = "Pending",
    SUCCESSED = "Successed",
}

export enum SeatStatus {
    CANCELLED = "Cancelled",
    PENDING = "Pending",
    SUCCESSED = "Successed",
    OVER_DATE = 'Overdated',
}